<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantResolutionTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_current_with_header(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Daffodil International University',
            'slug' => 'diu',
            'subdomain' => 'diu',
            'support_email' => 'support@diu.example.com',
            'logo_text' => 'DIU',
            'primary_color' => '#d4a033',
            'accent_color' => '#f59e0b',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Host', 'localhost')
            ->withHeader('X-Tenant', 'diu')
            ->getJson('/api/tenant/current');

        $response->assertStatus(200);
        $response->assertJsonFragment(['slug' => 'diu', 'name' => $tenant->name]);
    }

    public function test_tenant_current_with_subdomain_host(): void
    {
        Tenant::query()->create([
            'name' => 'BRAC University',
            'slug' => 'brac',
            'subdomain' => 'brac',
            'support_email' => 'support@brac.example.com',
            'logo_text' => 'BR',
            'primary_color' => '#7c3aed',
            'accent_color' => '#a78bfa',
            'status' => 'active',
        ]);

        $response = $this->withHeader('Host', 'brac.localhost')
            ->getJson('/api/tenant/current');

        $response->assertStatus(200);
        $response->assertJsonFragment(['slug' => 'brac']);
    }

    public function test_unknown_tenant_returns_not_found(): void
    {
        $response = $this->withHeader('Host', 'unknown.localhost')
            ->getJson('/api/tenant/current');

        $response->assertStatus(404);
        $response->assertJson(['code' => 'TENANT_NOT_FOUND']);
    }

    public function test_inactive_tenant_returns_inactive(): void
    {
        Tenant::query()->create([
            'name' => 'Tepantor Academy',
            'slug' => 'tepantor',
            'subdomain' => 'tepantor',
            'support_email' => 'support@tepantor.example.com',
            'logo_text' => 'TA',
            'primary_color' => '#0f766e',
            'accent_color' => '#14b8a6',
            'status' => 'inactive',
        ]);

        $response = $this->withHeader('Host', 'tepantor.localhost')
            ->getJson('/api/tenant/current');

        $response->assertStatus(403);
        $response->assertJson(['code' => 'TENANT_INACTIVE']);
    }

    public function test_cross_tenant_login_fails(): void
    {
        $diu = Tenant::query()->create([
            'name' => 'Daffodil International University',
            'slug' => 'diu',
            'subdomain' => 'diu',
            'support_email' => 'support@diu.example.com',
            'logo_text' => 'DIU',
            'primary_color' => '#d4a033',
            'accent_color' => '#f59e0b',
            'status' => 'active',
        ]);

        $brac = Tenant::query()->create([
            'name' => 'BRAC University',
            'slug' => 'brac',
            'subdomain' => 'brac',
            'support_email' => 'support@brac.example.com',
            'logo_text' => 'BR',
            'primary_color' => '#7c3aed',
            'accent_color' => '#a78bfa',
            'status' => 'active',
        ]);

        User::query()->create([
            'tenant_id' => $diu->id,
            'name' => 'DIU Admin',
            'email' => 'admin@diu.test',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this->withHeader('Host', 'brac.localhost')
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@diu.test',
                'password' => 'password',
            ]);

        $response->assertStatus(422);
    }
}
