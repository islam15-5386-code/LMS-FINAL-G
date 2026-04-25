<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditEvent;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $auditEvents = AuditEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->when($request->filled('action'), fn ($query) => $query->where('action', $request->string('action')->toString()))
            ->latest()
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $auditEvents->getCollection()->map(fn (AuditEvent $auditEvent): array => LmsSupport::serializeAuditEvent($auditEvent))->all(),
            'meta' => [
                'currentPage' => $auditEvents->currentPage(),
                'lastPage' => $auditEvents->lastPage(),
                'perPage' => $auditEvents->perPage(),
                'total' => $auditEvents->total(),
            ],
        ]);
    }
}
