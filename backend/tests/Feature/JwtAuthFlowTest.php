<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JwtAuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_login_success_returns_bearer_jwt_token(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('token_type', 'Bearer');
        $response->assertJsonPath('role', 'admin');
        $this->assertNotEmpty($response->json('access_token'));
    }

    public function test_invalid_login_returns_422(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_me_with_valid_token_works(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'teacher@example.com',
            'password' => 'password123',
        ])->assertOk();

        $token = (string) $login->json('access_token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.user.email', 'teacher@example.com')
            ->assertJsonPath('data.user.role', 'teacher');
    }

    public function test_logout_revokes_token(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'student@example.com',
            'password' => 'password123',
        ])->assertOk();

        $token = (string) $login->json('access_token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/auth/logout')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_token_cannot_be_used_against_another_tenant(): void
    {
        \App\Models\Tenant::query()->create([
            'name' => 'Tenant B',
            'slug' => 'tenant-b',
            'subdomain' => 'tenant-b',
            'support_email' => 'support@tenant-b.test',
            'logo_text' => 'TB',
            'primary_color' => '#1d4ed8',
            'accent_color' => '#06b6d4',
            'status' => 'active',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password123',
        ])->assertOk();

        $token = (string) $login->json('access_token');

        $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'X-Tenant' => 'tenant-b',
        ])
            ->getJson('/api/v1/auth/me')
            ->assertForbidden()
            ->assertJsonPath('code', 'TENANT_MISMATCH');
    }

    public function test_role_wise_redirect_mapping_from_login_role(): void
    {
        $cases = [
            ['email' => 'admin@example.com', 'role' => 'admin', 'dashboard' => '/admin/dashboard'],
            ['email' => 'teacher@example.com', 'role' => 'teacher', 'dashboard' => '/teacher/dashboard'],
            ['email' => 'student@example.com', 'role' => 'student', 'dashboard' => '/student/dashboard'],
        ];

        foreach ($cases as $case) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => $case['email'],
                'password' => 'password123',
            ]);

            $response->assertOk()->assertJsonPath('role', $case['role']);

            $dashboard = match ($response->json('role')) {
                'admin' => '/admin/dashboard',
                'teacher' => '/teacher/dashboard',
                default => '/student/dashboard',
            };

            $this->assertSame($case['dashboard'], $dashboard);
        }
    }
}
