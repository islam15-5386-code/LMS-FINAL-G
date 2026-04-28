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
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'tenant_name' => ['nullable', 'string', 'max:255'],
            'tenant_subdomain' => ['nullable', 'string', 'max:255'],
            'tenant_city' => ['nullable', 'string', 'max:255'],
            'tenant_phone' => ['nullable', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'in:admin,teacher,student'],
            'department' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

    // Prefer tenant resolved from middleware (subdomain). Fallback to payload resolver for compatibility.
    $tenant = $request->attributes->get('tenant') ?? $this->resolveTenant($validated);

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

        try {
            Mail::raw(
                "Welcome to {$tenant->name}, {$user->name}!\n\nYour account has been created successfully.\n\nRole: {$user->role}\nEmail: {$user->email}\n\nYou can now log in at {$tenant->custom_domain}.",
                function ($message) use ($user, $tenant) {
                    $message->to($user->email)->subject("Welcome to {$tenant->name}");
                }
            );
        } catch (\Throwable $e) {
            // Ignore email failure
        }

        return response()->json([
            'message' => 'Registration completed successfully.',
            'token' => $token,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => LmsSupport::serializeUser($user),
            'role' => $user->role,
            'tenant_id' => $user->tenant_id,
            'branding' => LmsSupport::serializeBranding($tenant),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);


        // Enforce tenant resolution from request attributes
        $tenant = $request->attributes->get('tenant');
        if ($tenant === null) {
            return response()->json(['message' => 'Institute not found.'], 404);
        }

        $user = User::query()
            ->with('tenant')
            ->where('email', $validated['email'])
            ->where('tenant_id', $tenant->id)
            ->first();

        if ($user === null || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials provided.',
            ], 422);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'User is blocked.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => LmsSupport::serializeUser($user),
            'role' => $user->role,
            'tenant_id' => $user->tenant_id,
            'branding' => $user->tenant !== null ? LmsSupport::serializeBranding($user->tenant) : null,
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
        if (isset($validated['tenant_id'])) {
            return Tenant::query()->findOrFail($validated['tenant_id']);
        }

        if (! isset($validated['tenant_name'])) {
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

        $tenantName = $validated['tenant_name'];
        $tenantCity = $validated['tenant_city'] ?? 'Dhaka';
        $tenantPhone = $validated['tenant_phone'] ?? '01710000002';
        $subdomain = $validated['tenant_subdomain'] ?? Str::slug((string) $tenantName);

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
        $role = Role::query()->where('name', $requestedRole)->first();

        if ($role !== null) {
            $user->roles()->syncWithoutDetaching([$role->id]);
        }
    }
}
