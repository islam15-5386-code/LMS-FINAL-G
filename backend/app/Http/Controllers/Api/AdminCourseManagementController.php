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
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'teacher_ids' => 'required|array',
            'teacher_ids.*' => 'required|integer|exists:users,id',
        ]);

        $teachers = User::query()
            ->whereIn('id', $validated['teacher_ids'])
            ->where('role', 'teacher')
            ->get();

        if ($teachers->count() !== count($validated['teacher_ids'])) {
            return response()->json(['message' => 'Some selected users are not teachers.'], 422);
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
        $this->authorizeAdmin($request);

        $enrollments = $course->enrollments()
            ->with('student')
            ->latest()
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'student_id' => $enrollment->student->id,
                'student_name' => $enrollment->student->name,
                'student_email' => $enrollment->student->email,
                'status' => $enrollment->status,
                'progress' => $enrollment->progress_percentage,
                'enrolled_at' => $enrollment->enrolled_at,
            ]);

        return response()->json(['data' => $enrollments]);
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
