<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LiveClass;
use App\Models\Notification;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $enrollments = Enrollment::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('student_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->with(['course.modules.lessons.completedUsers:id,name', 'course.teacher:id,name,email,department,city,profile_image_url,bio,rating_average,rating_count'])
            ->latest('enrolled_at')
            ->get();

        $enrolledCourseIds = $enrollments->pluck('course_id')->unique()->values();

        $courses = $enrollments
            ->map(function (Enrollment $enrollment) use ($user): ?array {
                $course = $enrollment->course;
                if ($course === null) {
                    return null;
                }

                $serialized = LmsSupport::serializeCourse($course, $user);
                $lessons = $course->modules->flatMap->lessons;

                return [
                    ...$serialized,
                    'progressPercentage' => (int) $enrollment->progress_percentage,
                    'status' => $enrollment->status,
                    'thumbnail' => $course->thumbnail_url,
                    'enrolledAt' => optional($enrollment->enrolled_at)->toIso8601String(),
                    'totalModules' => $course->modules->count(),
                    'totalLessons' => $lessons->count(),
                    'completedLessons' => $lessons->filter(fn ($lesson) => $lesson->completedUsers->contains('id', $user->id))->count(),
                ];
            })
            ->filter()
            ->values();

        $avgProgress = $enrollments->count() > 0
            ? (int) round($enrollments->avg('progress_percentage'))
            : 0;

        $certificates = Certificate::query()
            ->where('user_id', $user->id)
            ->where('revoked', false)
            ->latest('issued_at')
            ->get();

        $upcomingLiveClasses = LiveClass::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('course_id', $enrolledCourseIds)
            ->whereIn('status', ['scheduled', 'live'])
            ->orderBy('scheduled_at')
            ->limit(10)
            ->with(['course:id,title'])
            ->get()
            ->map(function (LiveClass $liveClass): array {
                $serialized = LmsSupport::serializeLiveClass($liveClass);
                $serialized['courseTitle'] = $liveClass->course?->title;
                return $serialized;
            })
            ->values();

        $announcements = Notification::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('audience', ['Student', 'All'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Notification $notification) => LmsSupport::serializeNotification($notification))
            ->values();

        $assessmentCount = Assessment::query()
            ->whereIn('course_id', $enrolledCourseIds)
            ->where('status', 'published')
            ->count();

        $activeLearners = Enrollment::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('status', ['active', 'completed'])
            ->distinct('student_id')
            ->count('student_id');

        $totalTenantCourses = Course::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('status', 'published')
            ->count();

        return response()->json([
            'data' => [
                'summary' => [
                    'totalCourses' => $totalTenantCourses,
                    'totalAssessments' => $assessmentCount,
                    'activeLearners' => $activeLearners,
                    'enrolledCourses' => $courses->count(),
                    'averageProgress' => $avgProgress,
                    'certificates' => $certificates->count(),
                    'upcomingLiveClasses' => $upcomingLiveClasses->count(),
                ],
                'courses' => $courses->all(),
                'certificates' => $certificates->map(fn (Certificate $certificate): array => [
                    'id' => $certificate->id,
                    'courseId' => $certificate->course_id,
                    'courseTitle' => $certificate->course_title,
                    'issuedAt' => optional($certificate->issued_at)->toIso8601String(),
                    'verificationCode' => $certificate->verification_code,
                ])->all(),
                'liveClasses' => $upcomingLiveClasses->all(),
                'announcements' => $announcements->all(),
            ],
        ]);
    }

    public function announcements(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $items = Notification::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('audience', ['Student', 'All'])
            ->latest()
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $items->getCollection()->map(fn (Notification $notification): array => LmsSupport::serializeNotification($notification))->all(),
            'meta' => [
                'currentPage' => $items->currentPage(),
                'lastPage' => $items->lastPage(),
                'perPage' => $items->perPage(),
                'total' => $items->total(),
            ],
        ]);
    }
}
