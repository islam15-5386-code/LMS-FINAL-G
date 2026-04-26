<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LiveClass;
use App\Models\LiveClassParticipant;
use App\Models\LiveClassRecording;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class LiveClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $query = $this->visibleLiveClassesQuery($user)
            ->with(['course:id,tenant_id,title', 'teacher:id,name', 'participants', 'recordings'])
            ->latest('scheduled_at');

        return response()->json([
            'success' => true,
            'data' => $query->get()->map(fn (LiveClass $liveClass): array => LmsSupport::serializeLiveClass($liveClass))->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'batch_name' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:300'],
            'meeting_type' => ['nullable', 'in:jitsi'],
            'meeting_link' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', 'in:scheduled,live,completed,cancelled'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);
        abort_if($course->tenant_id !== $user->tenant_id, 404, 'Course not found.');

        $startAt = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['start_time'], config('app.timezone'));
        $endAt = Carbon::createFromFormat('Y-m-d H:i', $validated['date'] . ' ' . $validated['end_time'], config('app.timezone'));

        abort_if($endAt->lessThanOrEqualTo($startAt), 422, 'End time must be after start time.');

        $meetingType = 'jitsi';
        $roomSlug = Str::slug($validated['title']) . '-' . Str::lower(Str::random(8));
        $meetingLink = 'https://meet.jit.si/' . $roomSlug;

        $liveClass = LiveClass::query()->create([
            'tenant_id' => $user->tenant_id,
            'course_id' => $course->id,
            'teacher_id' => $user->role === 'teacher' ? $user->id : ($course->teacher_id ?? $user->id),
            'batch_name' => $validated['batch_name'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'meeting_type' => $meetingType,
            'meeting_link' => $meetingLink,
            'provider' => 'Jitsi',
            'room_slug' => $roomSlug,
            'meeting_url' => $meetingLink,
            'scheduled_at' => $startAt,
            'start_at' => $startAt,
            'ends_at' => $endAt,
            'duration_minutes' => $validated['duration_minutes'],
            'participant_limit' => max(1, $course->enrollments()->count()),
            'reminder_24h' => true,
            'reminder_1h' => true,
            'reminder_24h_sent' => false,
            'reminder_1h_sent' => false,
            'status' => $validated['status'] ?? 'scheduled',
        ]);

        $liveClass->load(['participants', 'recordings']);

        LmsSupport::audit($user, 'Scheduled live class', $liveClass->title, $request->ip());
        LmsSupport::notify($user->tenant, 'Student', 'live-class', sprintf('Live class "%s" has been scheduled.', $liveClass->title));

        return response()->json([
            'success' => true,
            'message' => 'Live class scheduled successfully.',
            'data' => LmsSupport::serializeLiveClass($liveClass),
        ], 201);
    }

    public function show(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $request->user();
        $this->authorizeVisibleLiveClass($user, $liveClass);

        return response()->json([
            'success' => true,
            'data' => LmsSupport::serializeLiveClass($liveClass->load(['course:id,tenant_id,title', 'teacher:id,name', 'participants', 'recordings'])),
        ]);
    }

    public function goLive(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->authorizeManageLiveClass($user, $liveClass);

        $liveClass->update([
            'status' => 'live',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Live class is now live.',
            'data' => LmsSupport::serializeLiveClass($liveClass->fresh()->load(['participants', 'recordings'])),
        ]);
    }

    public function complete(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->authorizeManageLiveClass($user, $liveClass);

        $liveClass->update([
            'status' => 'completed',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Live class completed.',
            'data' => LmsSupport::serializeLiveClass($liveClass->fresh()->load(['participants', 'recordings'])),
        ]);
    }

    public function markRecorded(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->authorizeManageLiveClass($user, $liveClass);

        $validated = $request->validate([
            'recording_url' => ['nullable', 'url'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        $recording = LiveClassRecording::query()->create([
            'tenant_id' => $liveClass->tenant_id,
            'live_class_id' => $liveClass->id,
            'recording_url' => $validated['recording_url'] ?? $liveClass->recording_url ?? $liveClass->meeting_url,
            'duration_seconds' => $validated['duration_seconds'] ?? ($liveClass->duration_minutes * 60),
            'duration' => $validated['duration_seconds'] ?? ($liveClass->duration_minutes * 60),
        ]);

        $liveClass->update([
            'recording_url' => $recording->recording_url,
            'status' => 'recorded',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Live class marked as recorded.',
            'data' => [
                'live_class' => LmsSupport::serializeLiveClass($liveClass->fresh()->load(['participants', 'recordings'])),
                'recording' => [
                    'id' => $recording->id,
                    'recordingUrl' => $recording->recording_url,
                    'durationSeconds' => $recording->duration_seconds,
                ],
            ],
        ]);
    }

    public function join(Request $request, LiveClass $liveClass): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorizeVisibleLiveClass($user, $liveClass);

        if ($user->role !== 'student') {
            return response()->json([
                'message' => 'Only students can join as participant.',
            ], 403);
        }

        $isEnrolled = Enrollment::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('student_id', $user->id)
            ->where('course_id', $liveClass->course_id)
            ->exists();

        abort_if(! $isEnrolled, 403, 'You are not enrolled in this course.');

        $participant = LiveClassParticipant::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'live_class_id' => $liveClass->id,
                'student_id' => $user->id,
            ],
            [
                'joined_at' => now(),
                'left_at' => null,
            ]
        );

        Attendance::query()->updateOrCreate(
            [
                'live_class_id' => $liveClass->id,
                'student_id' => $user->id,
            ],
            [
                'status' => 'present',
                'joined_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'meeting_url' => $liveClass->meeting_url,
            'data' => [
                'id' => $participant->id,
                'studentId' => $participant->student_id,
                'joinedAt' => optional($participant->joined_at)->toIso8601String(),
                'leftAt' => optional($participant->left_at)->toIso8601String(),
            ],
        ]);
    }

    public function leave(Request $request, LiveClass $liveClass): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->authorizeVisibleLiveClass($user, $liveClass);

        $participant = LiveClassParticipant::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('live_class_id', $liveClass->id)
            ->where('student_id', $user->id)
            ->firstOrFail();

        $participant->update([
            'left_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Student left the live class.',
        ]);
    }

    public function updateStatus(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $this->authorizeManageLiveClass($user, $liveClass);

        $validated = $request->validate([
            'status' => ['required', 'in:scheduled,live,completed,recorded,cancelled'],
            'recording_url' => ['nullable', 'url'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validated['status'] === 'live') {
            return $this->goLive($request, $liveClass);
        }

        if ($validated['status'] === 'completed') {
            return $this->complete($request, $liveClass);
        }

        if ($validated['status'] === 'recorded') {
            return $this->markRecorded($request, $liveClass);
        }

        $liveClass->update([
            'status' => $validated['status'],
            'recording_url' => $validated['recording_url'] ?? $liveClass->recording_url,
        ]);

        LmsSupport::audit($user, 'Updated live class status', $liveClass->title, $request->ip());

        return response()->json([
            'success' => true,
            'message' => 'Live class status updated successfully.',
            'data' => LmsSupport::serializeLiveClass($liveClass->fresh()->load(['participants', 'recordings'])),
        ]);
    }

    private function visibleLiveClassesQuery(User $user)
    {
        $query = LiveClass::query()
            ->where('tenant_id', $user->tenant_id);

        if ($user->role === 'teacher') {
            $query->where('teacher_id', $user->id);
        }

        if ($user->role === 'student') {
            $courseIds = Enrollment::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('student_id', $user->id)
                ->pluck('course_id');

            $query->whereIn('course_id', $courseIds);
        }

        return $query;
    }

    private function authorizeVisibleLiveClass(User $user, LiveClass $liveClass): void
    {
        abort_if($liveClass->tenant_id !== $user->tenant_id, 403, 'Invalid tenant access.');

        if ($user->role === 'teacher') {
            abort_if($liveClass->teacher_id !== $user->id, 403, 'You cannot access this live class.');
        }

        if ($user->role === 'student') {
            $isEnrolled = Enrollment::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('student_id', $user->id)
                ->where('course_id', $liveClass->course_id)
                ->exists();

            abort_if(! $isEnrolled, 403, 'You cannot access this live class.');
        }
    }

    private function authorizeManageLiveClass(User $user, LiveClass $liveClass): void
    {
        abort_if($liveClass->tenant_id !== $user->tenant_id, 403, 'Invalid tenant access.');

        if ($user->role === 'teacher') {
            abort_if($liveClass->teacher_id !== $user->id, 403, 'You cannot manage this live class.');
        }
    }

}
