<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DirectoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'hr_manager']);

        $users = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($inner) use ($request): void {
                    $search = '%' . $request->string('search')->toString() . '%';
                    $inner->where('name', 'like', $search)
                        ->orWhere('email', 'like', $search)
                        ->orWhere('phone', 'like', $search)
                        ->orWhere('department', 'like', $search);
                })
            )
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $users->getCollection()->map(fn (User $directoryUser): array => LmsSupport::serializeUser($directoryUser))->all(),
            'meta' => [
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'perPage' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function byRole(Request $request, string $role): JsonResponse
    {
        abort_unless(in_array($role, ['super_admin', 'admin', 'teacher', 'student', 'hr_manager'], true), 404, 'Role not found.');

        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'hr_manager']);

        $users = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('role', $role)
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $users->getCollection()->map(fn (User $directoryUser): array => LmsSupport::serializeUser($directoryUser))->all(),
            'meta' => [
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'perPage' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }
}
