<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_access_management_apis(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $course = Course::query()->where('tenant_id', $admin->tenant_id)->firstOrFail();
        $teacher = User::query()->where('tenant_id', $admin->tenant_id)->where('role', 'teacher')->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/courses')
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/courses/{$course->id}/teachers", ['teacher_id' => $teacher->id])
            ->assertOk();
    }

    public function test_teacher_cannot_access_admin_or_student_scoped_apis(): void
    {
        $teacher = User::query()->where('role', 'teacher')->firstOrFail();

        $this->actingAs($teacher, 'sanctum')
            ->getJson('/api/v1/admin/courses')
            ->assertForbidden();

        $this->actingAs($teacher, 'sanctum')
            ->getJson('/api/v1/student/my-courses')
            ->assertForbidden();
    }

    public function test_teacher_can_access_teacher_scoped_api(): void
    {
        $teacher = User::query()->where('role', 'teacher')->firstOrFail();

        $this->actingAs($teacher, 'sanctum')
            ->getJson('/api/v1/teacher/question-bank/fallback')
            ->assertOk();
    }

    public function test_student_cannot_access_admin_or_teacher_scoped_apis(): void
    {
        $student = User::query()->where('role', 'student')->firstOrFail();

        $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/admin/courses')
            ->assertForbidden();

        $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/teacher/assessments/generate', [
                'course_id' => 1,
                'title' => 'Blocked',
                'type' => 'MCQ',
            ])
            ->assertForbidden();
    }

    public function test_student_can_access_student_scoped_api(): void
    {
        $student = User::query()->where('role', 'student')->firstOrFail();

        $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/student/my-courses')
            ->assertOk();
    }

    public function test_admin_cannot_access_teacher_or_student_scoped_api(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/teacher/question-bank/fallback')
            ->assertForbidden();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/student/my-courses')
            ->assertForbidden();
    }

    public function test_tenant_a_admin_cannot_manage_tenant_b_user(): void
    {
        $tenantAAdmin = User::query()->where('role', 'admin')->firstOrFail();

        $tenantB = Tenant::query()->create([
            'name' => 'Tenant B',
            'slug' => 'tenant-b',
            'subdomain' => 'tenant-b',
            'support_email' => 'support@tenant-b.test',
            'logo_text' => 'TB',
            'primary_color' => '#1d4ed8',
            'accent_color' => '#06b6d4',
            'status' => 'active',
        ]);

        $tenantBUser = User::query()->create([
            'tenant_id' => $tenantB->id,
            'name' => 'Tenant B Student',
            'email' => 'tenant-b-student@example.com',
            'password' => 'password123',
            'role' => 'student',
            'is_active' => true,
        ]);

        $this->actingAs($tenantAAdmin, 'sanctum')
            ->getJson("/api/v1/admin/users/{$tenantBUser->id}")
            ->assertNotFound();
    }

    public function test_admin_cannot_assign_cross_tenant_teacher_when_creating_course(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $tenantB = Tenant::factory()->create(['subdomain' => 'tenant-b-course']);
        $tenantBTeacher = User::factory()->create([
            'tenant_id' => $tenantB->id,
            'role' => 'teacher',
            'is_active' => true,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/courses', [
                'title' => 'Cross Tenant Course',
                'category' => 'Security',
                'description' => 'This should not be allowed.',
                'price' => 1000,
                'teacher_id' => $tenantBTeacher->id,
            ])
            ->assertStatus(422);
    }

    public function test_student_cannot_pay_for_cross_tenant_course(): void
    {
        $student = User::query()->where('role', 'student')->firstOrFail();
        $tenantB = Tenant::factory()->create(['subdomain' => 'tenant-b-payment']);
        $course = Course::factory()->create([
            'tenant_id' => $tenantB->id,
            'status' => 'published',
            'price' => 500,
        ]);

        $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/payments', [
                'course_id' => $course->id,
                'amount' => 500,
                'transaction_id' => 'cross-tenant-payment-test',
            ])
            ->assertNotFound();
    }
}
