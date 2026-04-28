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
            ->latest()
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $courses->getCollection()->map(fn (Course $course) => [
                'id' => $course->id,
                'title' => $course->title,
                'category' => $course->category,
                'teacher_id' => $course->teacher_id,
                'status' => $course->status,
                'enrollment_count' => $course->enrollments_count,
                'teacher_count' => $course->teachers_count,
                'created_at' => $course->created_at,
            ]),
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

        return response()->json(['data' => $teachers]);
    }

    /**
     * Assign teachers to a course.
     */
    public function assignTeachers(Request $request, Course $course): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Authorize: Admin or the course owner
        if ($user->role !== 'admin' && $course->teacher_id !== $user->id) {
            abort(403, 'Only admins or the course owner can assign teachers.');
        }

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

        $course->teachers()->syncWithoutDetaching($teachers->pluck('id')->all());

        // Sync tenant_id in pivot if needed (since syncWithoutDetaching doesn't easily set extra pivot attributes without a loop or specific logic)
        // But our pivot has tenant_id. We should set it.
        foreach ($teachers as $teacher) {
            DB::table('course_teacher')
                ->updateOrInsert(
                    ['course_id' => $course->id, 'teacher_id' => $teacher->id],
                    ['tenant_id' => $course->tenant_id, 'updated_at' => now(), 'created_at' => now()]
                );
        }

        return response()->json(['message' => 'Teachers assigned successfully.']);
    }

    /**
     * Remove a teacher from a course.
     */
    public function removeTeacher(Request $request, Course $course, User $teacher): JsonResponse
    {
        $this->authorizeAdmin($request);

        $course->teachers()->detach($teacher->id);

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
}
