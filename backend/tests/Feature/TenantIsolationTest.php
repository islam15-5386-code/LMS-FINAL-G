<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Course;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_a_cannot_see_tenant_b_courses()
    {
        $tenantA = Tenant::factory()->create(['subdomain' => 'tenant-a']);
        $tenantB = Tenant::factory()->create(['subdomain' => 'tenant-b']);
        $userA = User::factory()->create([
            'tenant_id' => $tenantA->id,
            'role' => 'admin',
            'is_active' => true,
        ]);

        $courseB = Course::factory()->create(['tenant_id' => $tenantB->id, 'title' => 'Secret B']);

        // Make request as tenant A host
        $response = $this->actingAs($userA, 'sanctum')
            ->withHeader('Host', 'tenant-a.localhost')
            ->getJson('/api/v1/courses');

        $response->assertStatus(200);
        $this->assertStringNotContainsString('Secret B', $response->getContent());
    }

    public function test_tenant_a_cannot_see_tenant_b_users()
    {
        $tenantA = Tenant::factory()->create(['subdomain' => 'tenant-a']);
        $tenantB = Tenant::factory()->create(['subdomain' => 'tenant-b']);
        $userA = User::factory()->create([
            'tenant_id' => $tenantA->id,
            'role' => 'admin',
            'is_active' => true,
        ]);

        $userB = User::factory()->create(['tenant_id' => $tenantB->id, 'email' => 'b@example.com']);

        $response = $this->actingAs($userA, 'sanctum')
            ->withHeader('Host', 'tenant-a.localhost')
            ->getJson('/api/v1/users');

        $response->assertStatus(200);
        $this->assertStringNotContainsString('b@example.com', $response->getContent());
    }
}
