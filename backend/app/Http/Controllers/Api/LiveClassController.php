<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LiveClass;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LiveClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $liveClasses = LiveClass::query()
            ->whereHas('course', fn ($query) => $query->where('tenant_id', $user->tenant_id))
            ->orderBy('start_at')
            ->get();

        return response()->json([
            'data' => $liveClasses->map(fn (LiveClass $liveClass): array => LmsSupport::serializeLiveClass($liveClass))->all(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'start_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'participant_limit' => ['nullable', 'integer', 'min:1'],
            'provider' => ['nullable', 'string', 'max:50'],
            'reminder_24h' => ['nullable', 'boolean'],
            'reminder_1h' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:scheduled,live,recorded,cancelled,completed'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);
        abort_if($course->tenant_id !== $user->tenant_id, 404, 'Course not found.');

        $liveClass = LiveClass::query()->create([
            'course_id' => $course->id,
            'teacher_id' => $course->teacher_id ?? $user->id,
            'title' => $validated['title'],
            'meeting_url' => sprintf(
                'https://meet.jit.si/%s',
                Str::slug(($user->tenant?->subdomain ?? 'betopia') . '-' . $validated['title'])
            ),
            'recording_url' => null,
            'start_at' => $validated['start_at'],
            'duration_minutes' => $validated['duration_minutes'],
            'participant_limit' => $validated['participant_limit'] ?? 100,
            'provider' => $validated['provider'] ?? 'Jitsi',
            'reminder_24h' => $validated['reminder_24h'] ?? true,
            'reminder_1h' => $validated['reminder_1h'] ?? true,
            'status' => $validated['status'] ?? 'scheduled',
        ]);

        LmsSupport::audit($user, 'Scheduled live class', $liveClass->title, $request->ip());
        LmsSupport::notify($user->tenant, 'Student', 'live-class', sprintf('Live class "%s" has been scheduled.', $liveClass->title));
        LmsSupport::notify($user->tenant, 'Student', 'live-class', sprintf('Reminder queued for 24h and 1h before "%s".', $liveClass->title));

        return response()->json([
            'message' => 'Live class scheduled successfully.',
            'data' => LmsSupport::serializeLiveClass($liveClass),
        ], 201);
    }

    public function updateStatus(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        abort_if($liveClass->course?->tenant_id !== $user->tenant_id, 404, 'Live class not found.');

        $validated = $request->validate([
            'status' => ['required', 'in:scheduled,live,recorded,cancelled,completed'],
        ]);

        $liveClass->update([
            'status' => $validated['status'],
            'recording_url' => in_array($validated['status'], ['recorded', 'completed'], true)
                ? ($liveClass->recording_url ?? $liveClass->meeting_url)
                : $liveClass->recording_url,
        ]);

        LmsSupport::audit($user, 'Updated live class status', $liveClass->title, $request->ip());

        return response()->json([
            'message' => 'Live class status updated successfully.',
            'data' => LmsSupport::serializeLiveClass($liveClass->fresh()),
        ]);
    }
}
