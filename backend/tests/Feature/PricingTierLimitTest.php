<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LiveClass;
use App\Models\LiveClassParticipant;
use App\Models\SubscriptionPlan;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingTierLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_basic_plan_ai_access_blocked(): void
    {
        [$teacher, $course] = $this->teacherWithPlan('Starter');

        $response = $this->actingAs($teacher, 'sanctum')->postJson('/api/v1/assessments/generate', [
            'course_id' => $course->id,
            'type' => 'MCQ',
            'question_count' => 2,
        ]);

        $response->assertStatus(403)->assertJson([
            'feature' => 'ai_access',
        ]);
    }

    public function test_standard_plan_ai_access_limited(): void
    {
        [$teacher, $course] = $this->teacherWithPlan('Growth');

        for ($i = 0; $i < 30; $i++) {
            Assessment::query()->create([
                'course_id' => $course->id,
                'title' => "AI Generated {$i}",
                'type' => 'MCQ',
                'status' => 'draft',
                'generated_from' => 'limit-test',
                'ai_generated' => true,
                'question_count' => 2,
                'passing_mark' => 50,
                'total_marks' => 100,
                'rubric_keywords' => ['test'],
                'teacher_reviewed' => false,
            ]);
        }

        $response = $this->actingAs($teacher, 'sanctum')->postJson('/api/v1/assessments/generate', [
            'course_id' => $course->id,
            'type' => 'MCQ',
            'question_count' => 2,
        ]);

        $response->assertStatus(403)->assertJson([
            'feature' => 'ai_access',
            'required_plan' => 'Professional',
        ]);
    }

    public function test_professional_plan_ai_access_allowed(): void
    {
        [$teacher, $course] = $this->teacherWithPlan('Professional');

        $response = $this->actingAs($teacher, 'sanctum')->postJson('/api/v1/assessments/generate', [
            'course_id' => $course->id,
            'type' => 'MCQ',
            'question_count' => 2,
        ]);

        $response->assertCreated();
    }

    public function test_live_class_cap_exceeded_returns_403(): void
    {
        [$student] = $this->studentWithPlan('Starter');
        $course = Course::query()->where('tenant_id', $student->tenant_id)->where('status', 'published')->firstOrFail();

        Enrollment::query()->firstOrCreate(
            ['tenant_id' => $student->tenant_id, 'course_id' => $course->id, 'student_id' => $student->id],
            ['status' => 'active', 'progress_percentage' => 0, 'enrolled_at' => now()]
        );

        $liveClass = LiveClass::query()->create([
            'tenant_id' => $student->tenant_id,
            'course_id' => $course->id,
            'teacher_id' => User::query()->where('tenant_id', $student->tenant_id)->where('role', 'teacher')->value('id'),
            'title' => 'Cap Test',
            'meeting_type' => 'jitsi',
            'meeting_link' => 'https://meet.jit.si/cap-test',
            'meeting_url' => 'https://meet.jit.si/cap-test',
            'scheduled_at' => now()->addHour(),
            'start_at' => now()->addHour(),
            'ends_at' => now()->addHours(2),
            'duration_minutes' => 60,
            'participant_limit' => 1,
            'provider' => 'Jitsi',
            'status' => 'scheduled',
        ]);

        LiveClassParticipant::query()->create([
            'tenant_id' => $student->tenant_id,
            'live_class_id' => $liveClass->id,
            'student_id' => User::query()->where('tenant_id', $student->tenant_id)->where('role', 'student')->where('id', '!=', $student->id)->value('id') ?? $student->id,
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($student, 'sanctum')->postJson("/api/v1/live-classes/{$liveClass->id}/join");
        $response->assertStatus(403)->assertJson(['feature' => 'live_class_participant_cap']);
    }

    public function test_api_access_basic_or_standard_forbidden_and_professional_allowed(): void
    {
        [$teacherGrowth] = $this->teacherWithPlan('Growth');
        $this->actingAs($teacherGrowth, 'sanctum')
            ->getJson('/api/v1/external/api/status')
            ->assertStatus(403)
            ->assertJson(['feature' => 'api_access']);

        [$teacherPro] = $this->teacherWithPlan('Professional');
        $this->actingAs($teacherPro, 'sanctum')
            ->getJson('/api/v1/external/api/status')
            ->assertOk();
    }

    public function test_cross_tenant_plan_leakage_blocked(): void
    {
        [$teacherStarter] = $this->teacherWithPlan('Starter');
        $this->teacherWithPlan('Professional', differentTenant: true);

        $this->actingAs($teacherStarter, 'sanctum')
            ->getJson('/api/v1/external/api/status')
            ->assertStatus(403);
    }

    private function teacherWithPlan(string $plan, bool $differentTenant = false): array
    {
        $query = User::query()->where('role', 'teacher');
        if ($differentTenant) {
            $query->where('tenant_id', '!=', User::query()->where('role', 'teacher')->value('tenant_id'));
        }
        $teacher = $query->firstOrFail();
        $this->applyPlan($teacher, $plan);
        $course = Course::query()->where('tenant_id', $teacher->tenant_id)->firstOrFail();
        return [$teacher, $course];
    }

    private function studentWithPlan(string $plan): array
    {
        $student = User::query()->where('role', 'student')->firstOrFail();
        $this->applyPlan($student, $plan);
        return [$student];
    }

    private function applyPlan(User $user, string $plan): void
    {
        $planRec = SubscriptionPlan::query()->firstOrCreate(
            ['name' => $plan],
            [
                'price' => 0,
                'student_limit' => 0,
                'ai_access' => $plan !== 'Starter',
                'live_class_limit' => $plan === 'Starter' ? 50 : ($plan === 'Growth' ? 200 : 1000),
                'white_label_enabled' => $plan === 'Professional',
                'overage_fee' => 0,
            ]
        );
        TenantSubscription::query()->updateOrCreate(
            ['tenant_id' => $user->tenant_id],
            ['plan_id' => $planRec->id, 'status' => 'active', 'started_at' => now()]
        );
        $user->tenant()->update(['plan_type' => $plan]);
    }
}
