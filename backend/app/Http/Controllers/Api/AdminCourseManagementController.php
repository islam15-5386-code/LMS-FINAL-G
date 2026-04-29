<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminCourseManagementController extends Controller
{
    /**
     * Display a listing of courses for the current tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $courses = Course::query()
            ->withCount(['enrollments', 'teachers'])
            ->with(['teacher:id,name,email', 'teachers:id'])
            ->latest()
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $courses->getCollection()->map(function (Course $course): array {
                $legacyTeacherExtra = $course->teacher_id !== null
                    ? (int) (!$course->teachers->contains('id', $course->teacher_id))
                    : 0;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'category' => $course->category,
                    'teacher_id' => $course->teacher_id,
                    'status' => $course->status,
                    'enrollment_count' => $course->enrollments_count,
                    // Merge legacy single-teacher column with pivot assignments.
                    'teacher_count' => (int) $course->teachers_count + $legacyTeacherExtra,
                    'created_at' => $course->created_at,
                ];
            }),
            'meta' => [
                'currentPage' => $courses->currentPage(),
                'lastPage' => $courses->lastPage(),
                'total' => $courses->total(),
            ]
        ]);
    }

    /**
     * List all teachers in the tenant.
     */
    public function teachers(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $teachers = User::query()
            ->where('role', 'teacher')
            ->where('is_active', true)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'department' => $user->department,
            ]);

        return response()->json(['data' => $teachers]);
    }

    /**
     * List teachers assigned to a specific course.
     */
    public function courseTeachers(Request $request, Course $course): JsonResponse
    {
        $this->authorizeAdmin($request);

        $teachers = $course->teachers()->get()->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'assigned_at' => $user->pivot->created_at,
        ]);

        if ($course->teacher_id !== null && !$teachers->contains('id', $course->teacher_id)) {
            $legacyTeacher = User::query()->find($course->teacher_id);
            if ($legacyTeacher !== null && $legacyTeacher->tenant_id === $course->tenant_id) {
                $teachers->prepend([
                    'id' => $legacyTeacher->id,
                    'name' => $legacyTeacher->name,
                    'email' => $legacyTeacher->email,
                    'assigned_at' => $course->updated_at,
                ]);
            }
        }

        return response()->json(['data' => $teachers]);
    }

    /**
     * Assign teachers to a course.
     */
    public function assignTeachers(Request $request, Course $course): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorizeAdmin($request);
        $this->authorize('assignTeacher', $course);

        $validated = $request->validate([
            'teacher_ids' => 'nullable|array',
            'teacher_ids.*' => 'integer|exists:users,id',
            'teacher_id' => 'nullable|integer|exists:users,id',
        ]);

        $teacherIds = $validated['teacher_ids'] ?? [];
        if ($request->filled('teacher_id')) {
            $teacherIds[] = $request->input('teacher_id');
        }

        $teacherIds = array_unique($teacherIds);

        if (empty($teacherIds)) {
            return response()->json(['message' => 'No teachers selected.'], 422);
        }

        $teachers = User::query()
            ->whereIn('id', $teacherIds)
            ->where('role', 'teacher')
            ->get();

        if ($teachers->count() === 0) {
            return response()->json(['message' => 'Selected users are not teachers.'], 422);
        }

        // Check if all teachers belong to the same tenant
        foreach ($teachers as $teacher) {
            if ($teacher->tenant_id !== $course->tenant_id) {
                return response()->json(['message' => 'Cross-tenant assignment is not allowed.'], 403);
            }
        }

        // Keep tenant_id explicit in pivot rows to satisfy strict multi-tenant constraints.
        foreach ($teachers as $teacher) {
            DB::table('course_teacher')
                ->updateOrInsert(
                    ['course_id' => $course->id, 'teacher_id' => $teacher->id],
                    ['tenant_id' => $course->tenant_id, 'updated_at' => now(), 'created_at' => now()]
                );
        }

        // Keep legacy field in sync for backward compatibility with older flows.
        if ($course->teacher_id === null) {
            $course->teacher_id = (int) $teachers->first()->id;
            $course->save();
        }

        return response()->json(['message' => 'Teachers assigned successfully.']);
    }

    /**
     * Remove a teacher from a course.
     */
    public function removeTeacher(Request $request, Course $course, User $teacher): JsonResponse
    {
        $this->authorizeAdmin($request);
        $this->authorize('assignTeacher', $course);
        abort_unless($teacher->tenant_id === $course->tenant_id, 404, 'Teacher not found.');

        $course->teachers()->detach($teacher->id);
        if ((int) $course->teacher_id === (int) $teacher->id) {
            $course->teacher_id = null;
            $course->save();
        }

        return response()->json(['message' => 'Teacher removed from course.']);
    }

    /**
     * List students enrolled in a course.
     */
    public function courseStudents(Request $request, Course $course): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Authorize: Admin or assigned teacher
        if ($user->role === 'teacher') {
            $isAssigned = $course->teachers()->where('users.id', $user->id)->exists();
            if (!$isAssigned && $course->teacher_id !== $user->id) {
                abort(403, 'You are not assigned to this course.');
            }
        } elseif ($user->role !== 'admin') {
            abort(403, 'Access denied.');
        }

        // Reuse the logic from CourseController if possible, but for now we'll inline it to be safe
        $enrolledUserIds = $course->enrollments()
            ->where('status', '!=', 'removed')
            ->pluck('student_id')
            ->toArray();

        $paidUserIds = \App\Models\Payment::query()
            ->where('course_id', $course->id)
            ->where('status', 'paid')
            ->pluck('user_id')
            ->toArray();

        $allStudentIds = array_unique(array_merge($enrolledUserIds, $paidUserIds));

        $students = User::query()
            ->whereIn('id', $allStudentIds)
            ->get()
            ->map(function (User $student) use ($course) {
                $enrollment = $course->enrollments()->where('student_id', $student->id)->first();
                $payment = \App\Models\Payment::query()
                    ->where('course_id', $course->id)
                    ->where('user_id', $student->id)
                    ->where('status', 'paid')
                    ->first();

                return [
                    'id' => $enrollment?->id ?? $student->id,
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'student_email' => $student->email,
                    'status' => $enrollment ? $enrollment->status : ($payment ? 'paid' : 'pending'),
                    'progress' => $enrollment ? $enrollment->progress_percentage : 0,
                    'enrolled_at' => $enrollment ? $enrollment->enrolled_at : ($payment ? $payment->created_at : null),
                ];
            });

        return response()->json(['data' => $students]);
    }

    /**
     * Remove (cancel enrollment) a student from a course.
     */
    public function removeStudent(Request $request, Course $course, User $student): JsonResponse
    {
        $this->authorizeAdmin($request);
        $this->authorize('removeStudent', $course);
        abort_unless($student->tenant_id === $course->tenant_id, 404, 'Student not found.');

        $enrollment = Enrollment::query()
            ->where('course_id', $course->id)
            ->where('student_id', $student->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found.'], 404);
        }

        $enrollment->update(['status' => 'removed']);

        return response()->json(['message' => 'Student enrollment removed successfully.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        /** @var User $user */
        $user = $request->user();
        if ($user->role !== 'admin') {
            abort(403, 'Only admins can perform this action.');
        }
    }

    public function storeCourse(Request $request): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'level' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:draft,published'],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        $teacherId = isset($validated['teacher_id']) ? (int) $validated['teacher_id'] : null;
        if ($teacherId) {
            $teacher = User::query()->findOrFail($teacherId);
            abort_unless($teacher->tenant_id === $admin->tenant_id && $teacher->role === 'teacher', 422, 'Invalid teacher.');
        }

        $course = Course::query()->create([
            'tenant_id' => $admin->tenant_id,
            'teacher_id' => $teacherId,
            'title' => $validated['title'],
            'slug' => \Illuminate\Support\Str::slug($validated['title'] . '-' . now()->timestamp),
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price_bdt' => (int) ($validated['price'] ?? 0),
            'price' => $validated['price'] ?? 0,
            'level' => $validated['level'] ?? 'Beginner',
            'status' => $validated['status'] ?? 'draft',
            'published_at' => ($validated['status'] ?? 'draft') === 'published' ? now() : null,
            'thumbnail_url' => 'https://cdn.example.com/thumbnails/' . \Illuminate\Support\Str::slug($validated['title']) . '.jpg',
            'enrollment_count' => 0,
            'what_you_will_learn' => [],
            'requirements' => [],
            'target_audience' => [],
        ]);

        if ($teacherId !== null) {
            DB::table('course_teacher')->updateOrInsert(
                ['course_id' => $course->id, 'teacher_id' => $teacherId],
                ['tenant_id' => $course->tenant_id, 'updated_at' => now(), 'created_at' => now()]
            );
        }

        return response()->json(['data' => $course], 201);
    }

    public function updateCourse(Request $request, Course $course): JsonResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'level' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:draft,published'],
            'teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        if (array_key_exists('teacher_id', $validated) && $validated['teacher_id'] !== null) {
            $teacher = User::query()->findOrFail((int) $validated['teacher_id']);
            abort_unless($teacher->tenant_id === $course->tenant_id && $teacher->role === 'teacher', 422, 'Invalid teacher.');
        }

        if (array_key_exists('price', $validated)) {
            $validated['price_bdt'] = (int) ($validated['price'] ?? 0);
        }
        if (($validated['status'] ?? null) === 'published' && $course->published_at === null) {
            $validated['published_at'] = now();
        }

        $course->update($validated);

        if (array_key_exists('teacher_id', $validated)) {
            $teacherId = $validated['teacher_id'] !== null ? (int) $validated['teacher_id'] : null;
            if ($teacherId !== null) {
                DB::table('course_teacher')->updateOrInsert(
                    ['course_id' => $course->id, 'teacher_id' => $teacherId],
                    ['tenant_id' => $course->tenant_id, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }

        return response()->json(['data' => $course->fresh()]);
    }

    public function destroyCourse(Request $request, Course $course): JsonResponse
    {
        $this->authorizeAdmin($request);
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully.']);
    }
}
