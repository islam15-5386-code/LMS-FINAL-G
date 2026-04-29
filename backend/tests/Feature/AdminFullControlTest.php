<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFullControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_assign_and_remove_teacher(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $course = Course::query()->where('tenant_id', $admin->tenant_id)->firstOrFail();
        $teacher = User::query()->where('tenant_id', $admin->tenant_id)->where('role', 'teacher')->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/admin/courses/{$course->id}/teachers", ['teacher_id' => $teacher->id])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/courses/{$course->id}/teachers/{$teacher->id}")
            ->assertOk();
    }

    public function test_admin_can_remove_student_from_course(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $course = Course::query()->where('tenant_id', $admin->tenant_id)->firstOrFail();
        $student = User::query()->where('tenant_id', $admin->tenant_id)->where('role', 'student')->firstOrFail();

        Enrollment::query()->firstOrCreate([
            'tenant_id' => $admin->tenant_id,
            'course_id' => $course->id,
            'student_id' => $student->id,
        ], [
            'status' => 'active',
            'progress_percentage' => 0,
            'enrolled_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/courses/{$course->id}/students/{$student->id}")
            ->assertOk();
    }

    public function test_admin_can_manage_courses(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();

        $create = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/courses', [
                'title' => 'Admin Controlled Course',
                'category' => 'Compliance',
                'description' => 'Managed by admin',
                'price' => 199,
                'status' => 'draft',
            ])
            ->assertCreated();

        $courseId = (int) $create->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/courses/{$courseId}", [
                'title' => 'Admin Controlled Course Updated',
                'status' => 'published',
            ])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/courses/{$courseId}")
            ->assertOk();
    }

    public function test_admin_can_manage_class_schedule(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $course = Course::query()->where('tenant_id', $admin->tenant_id)->firstOrFail();

        $create = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/live-classes', [
                'course_id' => $course->id,
                'title' => 'Admin Schedule',
                'date' => now()->addDay()->toDateString(),
                'start_time' => '10:00',
                'end_time' => '11:00',
                'duration_minutes' => 60,
            ])
            ->assertCreated();

        $liveClassId = (int) $create->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/live-classes/{$liveClassId}/status", [
                'status' => 'completed',
            ])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/live-classes/{$liveClassId}")
            ->assertOk();
    }

    public function test_admin_can_manage_payments(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $student = User::query()->where('tenant_id', $admin->tenant_id)->where('role', 'student')->firstOrFail();
        $course = Course::query()->where('tenant_id', $admin->tenant_id)->firstOrFail();

        $payment = Payment::query()->create([
            'tenant_id' => $admin->tenant_id,
            'user_id' => $student->id,
            'course_id' => $course->id,
            'amount' => 199,
            'due_amount' => 0,
            'status' => 'pending',
            'transaction_id' => 'TXN-ADMIN-1',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/payments')
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/payments/{$payment->id}", [
                'status' => 'paid',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');
    }

    public function test_admin_can_manage_certificates(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $student = User::query()->where('tenant_id', $admin->tenant_id)->where('role', 'student')->firstOrFail();
        $course = Course::query()->where('tenant_id', $admin->tenant_id)->firstOrFail();

        $issue = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/certificates', [
                'user_id' => $student->id,
                'course_id' => $course->id,
            ])
            ->assertCreated();

        $certificateId = (int) $issue->json('data.id');

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/admin/certificates/{$certificateId}/verify")
            ->assertOk()
            ->assertJsonPath('data.verified', true);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/v1/certificates/{$certificateId}/revoke")
            ->assertOk();
    }

    public function test_admin_can_view_and_export_reports(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/reports/compliance')
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->get('/api/v1/admin/reports/compliance/export/csv')
            ->assertOk();
    }

    public function test_teacher_and_student_get_403_for_admin_apis(): void
    {
        $teacher = User::query()->where('role', 'teacher')->firstOrFail();
        $student = User::query()->where('role', 'student')->firstOrFail();

        $this->actingAs($teacher, 'sanctum')
            ->getJson('/api/v1/admin/courses')
            ->assertForbidden();

        $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/admin/courses')
            ->assertForbidden();
    }

    public function test_cross_tenant_admin_access_is_blocked(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();

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

        $courseB = Course::query()->create([
            'tenant_id' => $tenantB->id,
            'title' => 'Tenant B Course',
            'slug' => 'tenant-b-course',
            'category' => 'General',
            'description' => 'Tenant B data',
            'price' => 100,
            'price_bdt' => 100,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/courses/{$courseB->id}", ['title' => 'Blocked']);

        $this->assertContains($response->getStatusCode(), [403, 404]);
    }
}
