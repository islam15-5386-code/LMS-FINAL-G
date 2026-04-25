<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LiveClass;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request, LiveClass $liveClass): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_if($liveClass->course?->tenant_id !== $user->tenant_id, 404, 'Live class not found.');

        $attendances = Attendance::query()
            ->where('live_class_id', $liveClass->id)
            ->with(['student:id,name', 'liveClass:id,title'])
            ->orderBy('student_id')
            ->get();

        return response()->json([
            'data' => $attendances->map(fn (Attendance $attendance): array => LmsSupport::serializeAttendance($attendance))->all(),
        ]);
    }

    public function store(Request $request, LiveClass $liveClass): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        abort_if($liveClass->course?->tenant_id !== $user->tenant_id, 404, 'Live class not found.');

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'status' => ['required', 'in:present,absent,late'],
            'joined_at' => ['nullable', 'date'],
        ]);

        $student = User::query()->findOrFail($validated['student_id']);
        abort_if($student->tenant_id !== $user->tenant_id, 404, 'Student not found.');

        $attendance = Attendance::query()->updateOrCreate(
            [
                'live_class_id' => $liveClass->id,
                'student_id' => $student->id,
            ],
            [
                'status' => $validated['status'],
                'joined_at' => $validated['joined_at'] ?? ($validated['status'] === 'absent' ? null : now()),
            ]
        );

        LmsSupport::audit($user, 'Updated attendance', $liveClass->title . ' / ' . $student->name, $request->ip());

        return response()->json([
            'message' => 'Attendance recorded successfully.',
            'data' => LmsSupport::serializeAttendance($attendance->load(['student:id,name', 'liveClass:id,title'])),
        ], 201);
    }
}
