<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillingProfile;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'vendor_id' => ['nullable', 'exists:tenants,id'],
            'tenant_name' => ['nullable', 'string', 'max:255'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'tenant_subdomain' => ['nullable', 'string', 'max:255'],
            'vendor_subdomain' => ['nullable', 'string', 'max:255'],
            'tenant_city' => ['nullable', 'string', 'max:255'],
            'vendor_city' => ['nullable', 'string', 'max:255'],
            'tenant_phone' => ['nullable', 'string', 'max:20'],
            'vendor_phone' => ['nullable', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'in:super_admin,admin,teacher,student,hr_manager'],
            'department' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $tenant = $this->resolveTenant($validated);

        $user = User::query()->create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'student',
            'department' => $validated['department'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? $tenant->city,
            'address' => $validated['address'] ?? $tenant->address,
            'is_active' => true,
        ]);

        $this->assignRole($user, $validated['role'] ?? 'student');
        BillingProfile::query()->firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan' => $tenant->plan_type ?? 'Starter',
                'active_students' => 0,
                'used_seats' => 0,
                'monthly_price' => 4900,
                'seat_limit' => 100,
                'overage_per_seat' => 80,
                'billing_status' => 'paid',
                'next_billing_at' => now()->addMonth()->startOfMonth(),
            ]
        );

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration completed successfully.',
            'token' => $token,
            'user' => LmsSupport::serializeUser($user),
            'branding' => LmsSupport::serializeBranding($tenant),
            'vendor' => LmsSupport::serializeVendorSummary($tenant),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->with('tenant')
            ->where('email', $validated['email'])
            ->first();

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials provided.',
            ], 422);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => LmsSupport::serializeUser($user),
            'branding' => $user->tenant !== null ? LmsSupport::serializeBranding($user->tenant) : null,
            'vendor' => $user->tenant !== null ? LmsSupport::serializeVendorSummary($user->tenant) : null,
            'bootstrap' => $user->tenant_id !== null ? LmsSupport::bootstrapPayload($user) : null,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->loadMissing('tenant');

        return response()->json([
            'data' => [
                'user' => LmsSupport::serializeUser($user),
                'branding' => $user->tenant !== null ? LmsSupport::serializeBranding($user->tenant) : null,
                'vendor' => $user->tenant !== null ? LmsSupport::serializeVendorSummary($user->tenant) : null,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    private function resolveTenant(array $validated): Tenant
    {
        if (isset($validated['tenant_id']) || isset($validated['vendor_id'])) {
            return Tenant::query()->findOrFail($validated['tenant_id'] ?? $validated['vendor_id']);
        }

        if (! isset($validated['tenant_name']) && ! isset($validated['vendor_name'])) {
            return Tenant::query()->first()
                ?? Tenant::query()->create([
                    'name' => 'Betopia Academy',
                    'city' => 'Dhaka',
                    'subdomain' => 'betopia',
                    'logo_text' => 'BA',
                    'primary_color' => '#0f766e',
                    'accent_color' => '#f97316',
                    'support_email' => 'support@betopiaacademy.com',
                    'custom_domain' => 'learn.betopiaacademy.com',
                    'address' => 'House 12, Road 7, Dhanmondi, Dhaka, Bangladesh',
                    'phone' => '01710000001',
                    'logo_url' => 'https://cdn.example.com/logos/betopia.png',
                    'plan_type' => 'Starter',
                    'status' => 'active',
                ]);
        }

        $tenantName = $validated['tenant_name'] ?? $validated['vendor_name'];
        $tenantCity = $validated['tenant_city'] ?? $validated['vendor_city'] ?? 'Dhaka';
        $tenantPhone = $validated['tenant_phone'] ?? $validated['vendor_phone'] ?? '01710000002';
        $subdomain = $validated['tenant_subdomain'] ?? $validated['vendor_subdomain'] ?? Str::slug((string) $tenantName);

        return Tenant::query()->firstOrCreate(
            ['subdomain' => $subdomain],
            [
                'name' => $tenantName,
                'city' => $tenantCity,
                'logo_text' => Str::upper(Str::substr(Str::slug((string) $tenantName, ''), 0, 4)),
                'primary_color' => '#0f766e',
                'accent_color' => '#f97316',
                'support_email' => 'support@' . $subdomain . '.example.com',
                'custom_domain' => 'learn.' . $subdomain . '.example.com',
                'address' => $tenantCity . ', Bangladesh',
                'phone' => $tenantPhone,
                'logo_url' => 'https://cdn.example.com/logos/' . $subdomain . '.png',
                'plan_type' => 'Starter',
                'status' => 'active',
            ]
        );
    }

    private function assignRole(User $user, string $requestedRole): void
    {
        $roleName = match ($requestedRole) {
            'admin' => 'tenant_admin',
            default => $requestedRole,
        };

        $role = Role::query()->where('name', $roleName)->first();

        if ($role !== null) {
            $user->roles()->syncWithoutDetaching([$role->id]);
        }
    }
}
