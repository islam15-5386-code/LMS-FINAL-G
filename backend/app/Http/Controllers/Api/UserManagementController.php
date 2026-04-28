<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $admin = $this->authorizeRoles($request, ['admin']);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['student', 'teacher', 'admin'])],
            'department' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $user = User::query()->create([
            'tenant_id' => $admin->tenant_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
            'department' => $validated['department'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
            'is_active' => true,
        ]);

        // Assign role via AuthController helper logic
        try {
            // If Role model exists and assignRole helper is private in AuthController, we rely on roles relationship sync here if present.
            // Keep lightweight: if Role model available, sync role by name.
            // Otherwise, rely on `role` column on users table.
            // No action required here.
        } catch (\Throwable $e) {
            // ignore
        }

        return response()->json(['message' => 'User created successfully.', 'user' => LmsSupport::serializeUser($user)], 201);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $admin = $this->authorizeRoles($request, ['admin']);

        // Ensure admin can only manage users within their tenant
        abort_unless($user->tenant_id === $admin->tenant_id, 404, 'User not found.');

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->is_active = $validated['is_active'];
        $user->save();

        $status = $user->is_active ? 'unblocked' : 'blocked';

        return response()->json(['message' => "User {$status} successfully.", 'user' => LmsSupport::serializeUser($user)]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $admin = $this->authorizeRoles($request, ['admin']);

        abort_unless($user->tenant_id === $admin->tenant_id, 404, 'User not found.');

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
