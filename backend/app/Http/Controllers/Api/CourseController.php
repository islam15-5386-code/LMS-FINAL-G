<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function publicIndex(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->where('status', 'published')
            ->withCount('enrollments')
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($inner) use ($request): void {
                    $search = '%' . $request->string('search')->toString() . '%';
                    $inner->where('title', 'like', $search)
                        ->orWhere('category', 'like', $search)
                        ->orWhere('level', 'like', $search);
                })
            )
            ->with('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($this->perPage($request, 12));

        return response()->json([
            'data' => $courses->getCollection()->map(fn (Course $course): array => LmsSupport::serializeCourse($course))->all(),
            'meta' => [
                'currentPage' => $courses->currentPage(),
                'lastPage' => $courses->lastPage(),
                'perPage' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $courses = Course::query()
            ->where('tenant_id', $user->tenant_id)
            ->when(
                $user->role === 'teacher',
                fn ($query) => $query->where(function ($inner) use ($user): void {
                    $inner->where('teacher_id', $user->id)
                        ->orWhereHas('teachers', fn ($teacherQuery) => $teacherQuery->where('users.id', $user->id));
                })
            )
            ->withCount('enrollments')
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($inner) use ($request): void {
                    $search = '%' . $request->string('search')->toString() . '%';
                    $inner->where('title', 'like', $search)
                        ->orWhere('category', 'like', $search)
                        ->orWhere('level', 'like', $search);
                })
            )
            ->with('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count')
            ->orderBy('title')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $courses->getCollection()->map(fn (Course $course): array => LmsSupport::serializeCourse($course, $user))->all(),
            'meta' => [
                'currentPage' => $courses->currentPage(),
                'lastPage' => $courses->lastPage(),
                'perPage' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'level' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:draft,published'],
            'teacher_id' => ['nullable', 'exists:users,id'],
            'what_you_will_learn' => ['nullable', 'array'],
            'what_you_will_learn.*' => ['string', 'max:255'],
            'requirements' => ['nullable', 'array'],
            'requirements.*' => ['string', 'max:255'],
            'target_audience' => ['nullable', 'array'],
            'target_audience.*' => ['string', 'max:255'],
        ]);

        $teacherId = $user->role === 'teacher' ? $user->id : ($validated['teacher_id'] ?? null);
        if ($teacherId !== null) {
            $teacher = User::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('role', 'teacher')
                ->find($teacherId);

            abort_if($teacher === null, 422, 'Selected teacher is not valid for this tenant.');
        }

        $course = Course::query()->create([
            'tenant_id' => $user->tenant_id,
            'teacher_id' => $teacherId,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title'] . '-' . now()->timestamp),
            'category' => $validated['category'],
            'description' => $validated['description'],
            'what_you_will_learn' => $validated['what_you_will_learn'] ?? [],
            'requirements' => $validated['requirements'] ?? [],
            'target_audience' => $validated['target_audience'] ?? [],
            'price_bdt' => (int) ($validated['price'] ?? 0),
            'price' => $validated['price'] ?? 0,
            'level' => $validated['level'] ?? 'Beginner',
            'status' => $validated['status'] ?? 'draft',
            'published_at' => ($validated['status'] ?? 'draft') === 'published' ? now() : null,
            'thumbnail_url' => 'https://cdn.example.com/thumbnails/' . Str::slug($validated['title']) . '.jpg',
            'enrollment_count' => 0,
        ]);

        LmsSupport::audit($user, 'Created course', $course->title, $request->ip());

        return response()->json([
            'message' => 'Course created successfully.',
            'data' => LmsSupport::serializeCourse($course->load('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count'), $user),
        ], 201);
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        $user = $this->userFromRequest($request);
        $this->guardTenantCourse($user, $course);

        return response()->json([
            'data' => LmsSupport::serializeCourse($course->load('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count'), $user),
        ]);
    }

    public function modules(Request $request, Course $course): JsonResponse
    {
        $user = $this->userFromRequest($request);
        $this->guardTenantCourse($user, $course);

        $modules = $course->modules()
            ->with('lessons.completedUsers:id,name')
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $modules->map(fn (CourseModule $module): array => LmsSupport::serializeModule($module, $user))->all(),
        ]);
    }

    public function moduleLessons(Request $request, CourseModule $module): JsonResponse
    {
        $user = $this->userFromRequest($request);
        $course = $module->course;
        abort_if($course === null, 404, 'Course not found.');
        $this->guardTenantCourse($user, $course);

        $lessons = $module->lessons()
            ->with('completedUsers:id,name')
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => $lessons->map(fn (Lesson $lesson): array => LmsSupport::serializeLesson($lesson, $user))->all(),
        ]);
    }

    public function assessments(Request $request, Course $course): JsonResponse
    {
        $user = $this->userFromRequest($request);
        $this->guardTenantCourse($user, $course);

        $assessments = $course->assessments()
            ->with('questions')
            ->where('status', 'published')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'data' => $assessments->map(fn ($assessment): array => LmsSupport::serializeAssessment($assessment))->all(),
        ]);
    }

    public function publish(Request $request, Course $course): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);

        $course->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        LmsSupport::audit($user, 'Published course', $course->title, $request->ip());
        LmsSupport::notify($user->tenant, 'Teacher', 'system', sprintf('Course "%s" was published.', $course->title));
        LmsSupport::notify($user->tenant, 'Student', 'system', sprintf('New course "%s" is now available.', $course->title));

        return response()->json([
            'message' => 'Course published successfully.',
            'data' => LmsSupport::serializeCourse($course->fresh()->load('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count'), $user),
        ]);
    }

    public function storeModule(Request $request, Course $course): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'drip_days' => ['nullable', 'integer', 'min:0'],
        ]);

        $module = $course->modules()->create([
            'title' => $validated['title'],
            'drip_days' => $validated['drip_days'] ?? 0,
            'position' => (int) $course->modules()->count() + 1,
        ]);

        LmsSupport::audit($user, 'Added course module', $module->title, $request->ip());

        return response()->json([
            'message' => 'Module created successfully.',
            'data' => LmsSupport::serializeModule($module->load('lessons.completedUsers:id,name'), $user),
        ], 201);
    }

    public function updateModule(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id, 404, 'Module not found for this course.');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'drip_days' => ['nullable', 'integer', 'min:0'],
        ]);

        $module->update([
            'title' => $validated['title'],
            'drip_days' => $validated['drip_days'] ?? 0,
        ]);

        LmsSupport::audit($user, 'Updated course module', $module->title, $request->ip());

        return response()->json([
            'message' => 'Module updated successfully.',
            'data' => LmsSupport::serializeModule($module->load('lessons.completedUsers:id,name'), $user),
        ]);
    }

    public function deleteModule(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id, 404, 'Module not found for this course.');

        $module->delete();

        LmsSupport::audit($user, 'Deleted course module', $module->title, $request->ip());

        return response()->json([
            'message' => 'Module deleted successfully.',
        ]);
    }

    public function reorderModules(Request $request, Course $course): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);

        $validated = $request->validate([
            'module_ids' => ['required', 'array'],
            'module_ids.*' => ['integer', 'exists:course_modules,id'],
        ]);

        foreach ($validated['module_ids'] as $index => $id) {
            $course->modules()->where('id', $id)->update(['position' => $index + 1]);
        }

        LmsSupport::audit($user, 'Reordered course modules', $course->title, $request->ip());

        return response()->json([
            'message' => 'Modules reordered successfully.',
            'data' => LmsSupport::serializeCourse($course->fresh()->load('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count'), $user),
        ]);
    }

    public function storeLesson(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id, 404, 'Module not found for this course.');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:video,document,quiz,assignment,live'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'release_at' => ['nullable', 'date'],
        ]);

        $lesson = $module->lessons()->create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'duration_minutes' => $validated['duration_minutes'] ?? 0,
            'release_at' => $validated['release_at'] ?? now()->addDays($module->drip_days),
            'position' => (int) $module->lessons()->count() + 1,
        ]);

        LmsSupport::audit($user, 'Added lesson', $lesson->title, $request->ip());

        return response()->json([
            'message' => 'Lesson created successfully.',
            'data' => LmsSupport::serializeLesson($lesson->load('completedUsers:id,name'), $user),
        ], 201);
    }

    public function updateLesson(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id || $lesson->course_module_id !== $module->id, 404, 'Lesson not found.');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:video,document,quiz,assignment,live'],
            'duration_minutes' => ['nullable', 'integer', 'min:0'],
            'release_at' => ['nullable', 'date'],
        ]);

        $lesson->update([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'duration_minutes' => $validated['duration_minutes'] ?? 0,
            'release_at' => $validated['release_at'] ?? now()->addDays($module->drip_days),
        ]);

        LmsSupport::audit($user, 'Updated lesson', $lesson->title, $request->ip());

        return response()->json([
            'message' => 'Lesson updated successfully.',
            'data' => LmsSupport::serializeLesson($lesson->load('completedUsers:id,name'), $user),
        ]);
    }

    public function deleteLesson(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id || $lesson->course_module_id !== $module->id, 404, 'Lesson not found.');

        $lesson->delete();

        LmsSupport::audit($user, 'Deleted lesson', $lesson->title, $request->ip());

        return response()->json([
            'message' => 'Lesson deleted successfully.',
        ]);
    }

    public function reorderLessons(Request $request, Course $course, CourseModule $module): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id, 404, 'Module not found.');

        $validated = $request->validate([
            'lesson_ids' => ['required', 'array'],
            'lesson_ids.*' => ['integer', 'exists:lessons,id'],
        ]);

        foreach ($validated['lesson_ids'] as $index => $id) {
            $module->lessons()->where('id', $id)->update(['position' => $index + 1]);
        }

        LmsSupport::audit($user, 'Reordered lessons', $module->title, $request->ip());

        return response()->json([
            'message' => 'Lessons reordered successfully.',
            'data' => LmsSupport::serializeModule($module->fresh()->load('lessons.completedUsers:id,name'), $user),
        ]);
    }

    public function completeLesson(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['student']);
        $this->guardTenantCourse($user, $course);
        abort_if($lesson->module?->course_id !== $course->id, 404, 'Lesson not found for this course.');

        $lesson->completedUsers()->syncWithoutDetaching([
            $user->id => ['completed_at' => now()],
        ]);

        $this->syncComplianceProgress($user, $course);
        LmsSupport::audit($user, 'Completed lesson', $lesson->title, $request->ip());

        return response()->json([
            'message' => 'Lesson marked as completed.',
            'data' => LmsSupport::serializeLesson($lesson->fresh()->load('completedUsers:id,name'), $user),
        ]);
    }

    public function uploadLessonContent(Request $request, Course $course, CourseModule $module, Lesson $lesson): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);
        abort_if($module->course_id !== $course->id || $lesson->course_module_id !== $module->id, 404, 'Lesson not found for this course.');

        $validated = $request->validate([
            'content' => ['required', 'file', 'mimes:pdf,mp4,docx,ppt,pptx,jpg,jpeg,png,webp', 'max:51200'],
        ]);

        $file = $validated['content'];
        $path = $file->store('lesson-content/' . $course->id, 'public');

        $lesson->update([
            'content_url' => Storage::disk('public')->url($path),
            'content_mime' => $file->getMimeType(),
            'content_original_name' => $file->getClientOriginalName(),
        ]);

        LmsSupport::audit($user, 'Uploaded lesson content', $lesson->title, $request->ip());

        return response()->json([
            'message' => 'Lesson content uploaded successfully.',
            'data' => LmsSupport::serializeLesson($lesson->fresh()->load('completedUsers:id,name'), $user),
        ], 201);
    }

    public function toggleAssessmentGate(Request $request, Course $course): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->guardManageCourse($user, $course);

        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $course->update([
            'assessment_gate_enabled' => $validated['enabled'],
        ]);

        LmsSupport::audit($user, 'Toggled assessment gate', $course->title . ': ' . ($validated['enabled'] ? 'ON' : 'OFF'), $request->ip());

        return response()->json([
            'message' => 'Assessment gate updated.',
            'data' => LmsSupport::serializeCourse($course->fresh()->load('modules.lessons.completedUsers:id,name', 'teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count'), $user),
        ]);
    }

    public function students(Request $request, Course $course): JsonResponse
    {
        $user = $this->userFromRequest($request);
        $this->guardTenantCourse($user, $course);

        // Authorize: Admin can see all, Teacher can see if assigned to this course
        if ($user->role === 'teacher') {
            $isAssigned = $course->teachers()->where('users.id', $user->id)->exists();
            if (!$isAssigned && $course->teacher_id !== $user->id) {
                abort(403, 'You are not assigned to this course.');
            }
        } elseif ($user->role !== 'admin') {
            abort(403, 'Only admins and assigned teachers can view students.');
        }

        // Fetch students from Enrollments
        $enrolledUserIds = $course->enrollments()
            ->where('status', '!=', 'removed')
            ->pluck('student_id')
            ->toArray();

        // Fetch students from Payments (status = paid)
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
                    'id' => $student->id, // this might be the enrollment id if we want to be consistent with previous API
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'student_email' => $student->email,
                    'status' => $enrollment ? $enrollment->status : ($payment ? 'paid' : 'pending'),
                    'progress' => $enrollment ? $enrollment->progress_percentage : 0,
                    'enrolled_at' => $enrollment ? $enrollment->enrolled_at : ($payment ? $payment->created_at : null),
                ];
            });

        return response()->json([
            'data' => $students,
        ]);
    }

    private function userFromRequest(Request $request): User
    {
        /** @var User $user */
        $user = $request->user()->loadMissing('tenant');

        return $user;
    }

    private function guardTenantCourse(User $user, Course $course): void
    {
        abort_if($course->tenant_id !== $user->tenant_id, 404, 'Course not found.');
    }

    private function guardManageCourse(User $user, Course $course): void
    {
        $this->guardTenantCourse($user, $course);

        if ($user->role !== 'teacher') {
            return;
        }

        $isAssigned = $course->teacher_id === $user->id
            || $course->teachers()->where('users.id', $user->id)->exists();

        abort_if(! $isAssigned, 403, 'You are not assigned to this course.');
    }

    private function syncComplianceProgress(User $user, Course $course): void
    {
        if ($user->role !== 'student') {
            return;
        }

        $course->loadMissing('modules.lessons');

        $totalLessons = $course->modules->flatMap->lessons->count();

        if ($totalLessons === 0) {
            return;
        }

        $completedLessons = $course->modules
            ->flatMap->lessons
            ->filter(fn (Lesson $lesson): bool => $lesson->completedUsers()->where('users.id', $user->id)->exists())
            ->count();

        $completionPercent = (int) round(($completedLessons / $totalLessons) * 100);

        $course->complianceRecords()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'tenant_id' => $user->tenant_id,
                'employee_name' => $user->name,
                'department' => $user->department ?? 'General',
                'role_title' => ucfirst($user->role),
                'course_title' => $course->title,
                'completion_percent' => $completionPercent,
                'certified' => $completionPercent >= 100,
            ]
        );

        if ($completionPercent >= 100) {
            $certificate = Certificate::query()->firstOrNew([
                'user_id' => $user->id,
                'course_id' => $course->id,
            ]);

            $wasRecentlyIssued = !$certificate->exists;

            $certificate->fill([
                'course_title' => $course->title,
                'certificate_number' => $certificate->certificate_number ?: LmsSupport::certificateNumber($user->id, $course->id),
                'issued_at' => $certificate->issued_at ?: now(),
                'verification_code' => $certificate->verification_code ?: LmsSupport::verificationCode(),
                'status' => 'active',
                'revoked' => false,
                'revoked_at' => null,
                'tenant_id' => $user->tenant_id,
            ]);
            $certificate->save();

            if ($wasRecentlyIssued) {
                LmsSupport::notify($user->tenant, 'Student', 'system', sprintf('Certificate issued for "%s".', $course->title));
            }
        }
    }
}
