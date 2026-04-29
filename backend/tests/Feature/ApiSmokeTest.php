<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected array $headers = [];
    protected string $token = '';
    protected string $adminEmail = '';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $tenant = Tenant::query()->orderBy('id')->firstOrFail();
        $subdomain = $tenant->subdomain ?? 'localhost';
        $smokeAdmin = User::query()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Smoke Admin',
            'email' => 'smoke-admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'is_active' => true,
        ]);
        $this->adminEmail = $smokeAdmin->email;

        $this->headers = [
            'Host' => 'localhost',
            'X-Tenant' => $subdomain,
            'Accept' => 'application/json',
        ];

        $login = $this->withHeaders($this->headers)->postJson('/api/v1/auth/login', [
            'email' => $this->adminEmail,
            'password' => 'password123',
        ]);
        $login->assertOk();
        $this->token = (string) ($login->json('access_token') ?? $login->json('token'));
    }

    public function test_api_smoke_login_and_me_and_core_modules(): void
    {
        $authHeaders = array_merge($this->headers, ['Authorization' => 'Bearer '.$this->token]);

        $this->withHeaders($authHeaders)->getJson('/api/v1/auth/me')->assertOk();
        $this->withHeaders($authHeaders)->getJson('/api/v1/courses')->assertOk();
        $this->withHeaders($authHeaders)->getJson('/api/v1/assessments')->assertOk();
        $this->withHeaders($authHeaders)->getJson('/api/v1/live-classes')->assertOk();
        $this->withHeaders($authHeaders)->postJson('/api/v1/payments/ssl/ipn')->assertOk();
        $this->withHeaders($authHeaders)->getJson('/api/v1/certificates')->assertOk();
        $this->withHeaders($authHeaders)->get('/api/v1/reports/compliance/export/csv')->assertOk();
    }
}
