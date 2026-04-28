<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $notifications = Notification::query()
            ->where('tenant_id', $user->tenant_id)
            ->when($request->filled('audience'), fn ($query) => $query->where('audience', $request->string('audience')->toString()))
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')->toString()))
            ->latest()
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $notifications->getCollection()->map(fn (Notification $notification): array => LmsSupport::serializeNotification($notification))->all(),
            'meta' => [
                'currentPage' => $notifications->currentPage(),
                'lastPage' => $notifications->lastPage(),
                'perPage' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if (!in_array($user->role, ['admin', 'teacher'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'audience' => 'required|string|in:Student,Teacher,All,Admin',
            'type' => 'required|string|in:system,announcement,assignment,assessment,live',
        ]);

        $notification = Notification::create([
            'tenant_id' => $user->tenant_id,
            'audience' => $validated['audience'],
            'type' => $validated['type'],
            'message' => $validated['message'],
        ]);

        return response()->json([
            'message' => 'Announcement posted successfully.',
            'data' => LmsSupport::serializeNotification($notification),
        ], 201);
    }
}
