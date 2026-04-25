<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\AuditEvent;
use App\Models\BillingProfile;
use App\Models\Certificate;
use App\Models\ComplianceRecord;
use App\Models\Course;
use App\Models\LiveClass;
use App\Models\Notification;
use App\Models\Submission;
use App\Models\Tenant;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoLmsSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::query()->updateOrCreate(
            ['subdomain' => 'betopia.smartlms.io'],
            [
                'name' => 'Betopia Academy',
                'logo_text' => 'BA',
                'primary_color' => '#0f766e',
                'accent_color' => '#f97316',
                'support_email' => 'support@betopiaacademy.com',
                'custom_domain' => 'learn.betopiaacademy.com',
                'is_active' => true,
            ]
        );

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@betopiaacademy.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Ayesha Rahman',
                'password' => 'password',
                'role' => 'admin',
                'department' => 'Operations',
            ]
        );

        $teacher = User::query()->updateOrCreate(
            ['email' => 'nafis@betopiaacademy.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Nafis Hasan',
                'password' => 'password',
                'role' => 'teacher',
                'department' => 'Faculty',
            ]
        );

        $studentRafi = User::query()->updateOrCreate(
            ['email' => 'rafi@student.betopia.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Rafi Khan',
                'password' => 'password',
                'role' => 'student',
                'department' => 'Product',
            ]
        );

        $studentMaya = User::query()->updateOrCreate(
            ['email' => 'maya@student.betopia.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Maya Sultana',
                'password' => 'password',
                'role' => 'student',
                'department' => 'Compliance',
            ]
        );

        BillingProfile::query()->updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'plan' => 'Growth',
                'active_students' => 412,
                'monthly_price' => 149,
                'seat_limit' => 500,
                'overage_per_seat' => 3,
            ]
        );

        $complianceCourse = Course::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'title' => 'Compliance Excellence Bootcamp'],
            [
                'category' => 'Compliance',
                'description' => 'Audit-ready compliance training with assessments, certificates, and reporting.',
                'status' => 'published',
                'price' => 299,
                'enrollment_count' => 214,
            ]
        );

        $aiCourse = Course::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'title' => 'AI Instructor Studio'],
            [
                'category' => 'Teaching',
                'description' => 'Create AI-assisted quizzes, essay rubrics, and faster teaching workflows.',
                'status' => 'published',
                'price' => 249,
                'enrollment_count' => 148,
            ]
        );

        $productCourse = Course::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'title' => 'Future of Product Teams'],
            [
                'category' => 'Leadership',
                'description' => 'A cohort-driven course on modern product strategy, systems, and delivery.',
                'status' => 'draft',
                'price' => 399,
                'enrollment_count' => 62,
            ]
        );

        $complianceModuleOne = $complianceCourse->modules()->updateOrCreate(
            ['title' => 'Policy Foundations'],
            ['drip_days' => 0, 'position' => 1]
        );

        $complianceModuleTwo = $complianceCourse->modules()->updateOrCreate(
            ['title' => 'Assessment and Certification'],
            ['drip_days' => 3, 'position' => 2]
        );

        $lessonScope = $complianceModuleOne->lessons()->updateOrCreate(
            ['title' => 'Understanding Policy Scope'],
            [
                'type' => 'video',
                'duration_minutes' => 18,
                'release_at' => Carbon::parse('2026-04-24 08:00:00', 'UTC'),
                'position' => 1,
            ]
        );

        $lessonChecklist = $complianceModuleOne->lessons()->updateOrCreate(
            ['title' => 'Compliance Checklist Workbook'],
            [
                'type' => 'document',
                'duration_minutes' => 12,
                'release_at' => Carbon::parse('2026-04-25 08:00:00', 'UTC'),
                'position' => 2,
            ]
        );

        $lessonAssessment = $complianceModuleTwo->lessons()->updateOrCreate(
            ['title' => 'Certification Assessment'],
            [
                'type' => 'quiz',
                'duration_minutes' => 25,
                'release_at' => Carbon::parse('2026-04-27 09:00:00', 'UTC'),
                'position' => 1,
            ]
        );

        $lessonScope->completedUsers()->syncWithoutDetaching([
            $studentRafi->id => ['completed_at' => Carbon::parse('2026-04-24 10:00:00', 'UTC')],
        ]);

        $aiModule = $aiCourse->modules()->updateOrCreate(
            ['title' => 'AI Lesson Design'],
            ['drip_days' => 0, 'position' => 1]
        );

        $lessonGenerate = $aiModule->lessons()->updateOrCreate(
            ['title' => 'Generating Assessments from Notes'],
            [
                'type' => 'document',
                'duration_minutes' => 16,
                'release_at' => Carbon::parse('2026-04-24 09:00:00', 'UTC'),
                'position' => 1,
            ]
        );

        $lessonRubric = $aiModule->lessons()->updateOrCreate(
            ['title' => 'Essay Rubric Calibration'],
            [
                'type' => 'assignment',
                'duration_minutes' => 22,
                'release_at' => Carbon::parse('2026-04-26 09:00:00', 'UTC'),
                'position' => 2,
            ]
        );

        $lessonGenerate->completedUsers()->syncWithoutDetaching([
            $studentRafi->id => ['completed_at' => Carbon::parse('2026-04-24 11:00:00', 'UTC')],
            $studentMaya->id => ['completed_at' => Carbon::parse('2026-04-24 11:15:00', 'UTC')],
        ]);

        $productModule = $productCourse->modules()->updateOrCreate(
            ['title' => 'Team Systems'],
            ['drip_days' => 0, 'position' => 1]
        );

        $productModule->lessons()->updateOrCreate(
            ['title' => 'Operating Cadence'],
            [
                'type' => 'video',
                'duration_minutes' => 20,
                'release_at' => Carbon::parse('2026-04-24 10:00:00', 'UTC'),
                'position' => 1,
            ]
        );

        $complianceAssessment = Assessment::query()->updateOrCreate(
            ['course_id' => $complianceCourse->id, 'title' => 'Compliance Readiness Quiz'],
            [
                'type' => 'MCQ',
                'status' => 'published',
                'generated_from' => 'Policy handbook upload',
                'question_count' => 6,
                'rubric_keywords' => ['compliance', 'audit', 'policy'],
                'teacher_reviewed' => true,
            ]
        );

        foreach (LmsSupport::generateAiQuestions('compliance audit evidence reporting policy remediation controls', 'MCQ', 6) as $index => $question) {
            $complianceAssessment->questions()->updateOrCreate(
                ['assessment_id' => $complianceAssessment->id, 'position' => $index + 1],
                [
                    'prompt' => $question['prompt'],
                    'options' => $question['options'],
                    'answer' => $question['answer'],
                ]
            );
        }

        $aiAssessment = Assessment::query()->updateOrCreate(
            ['course_id' => $aiCourse->id, 'title' => 'AI Teaching Reflection'],
            [
                'type' => 'Essay',
                'status' => 'published',
                'generated_from' => 'Teacher note upload',
                'question_count' => 1,
                'rubric_keywords' => ['ai', 'rubric', 'feedback'],
                'teacher_reviewed' => true,
            ]
        );

        foreach (LmsSupport::generateAiQuestions('ai assessment rubric feedback learning objective teacher review', 'Essay', 1) as $index => $question) {
            $aiAssessment->questions()->updateOrCreate(
                ['assessment_id' => $aiAssessment->id, 'position' => $index + 1],
                [
                    'prompt' => $question['prompt'],
                    'options' => $question['options'],
                    'answer' => $question['answer'],
                ]
            );
        }

        Submission::query()->updateOrCreate(
            ['assessment_id' => $aiAssessment->id, 'user_id' => $studentRafi->id],
            [
                'answer_text' => 'AI assessment can support a teacher by generating a rubric-based feedback loop and highlighting gaps in the response.',
                'score' => 87,
                'feedback' => 'Strong answer with clear alignment to rubric language.',
                'passed' => true,
                'submitted_at' => Carbon::parse('2026-04-23 11:00:00', 'UTC'),
            ]
        );

        LiveClass::query()->updateOrCreate(
            ['course_id' => $complianceCourse->id, 'title' => 'Weekly Compliance Q&A'],
            [
                'start_at' => Carbon::parse('2026-04-25 12:00:00', 'UTC'),
                'duration_minutes' => 60,
                'participant_limit' => 100,
                'provider' => 'Jitsi',
                'reminder_24h' => true,
                'reminder_1h' => true,
                'status' => 'scheduled',
            ]
        );

        LiveClass::query()->updateOrCreate(
            ['course_id' => $aiCourse->id, 'title' => 'AI Teaching Lab'],
            [
                'start_at' => Carbon::parse('2026-04-26 14:00:00', 'UTC'),
                'duration_minutes' => 75,
                'participant_limit' => 500,
                'provider' => 'Jitsi',
                'reminder_24h' => true,
                'reminder_1h' => true,
                'status' => 'recorded',
            ]
        );

        Certificate::query()->updateOrCreate(
            ['user_id' => $studentMaya->id, 'course_id' => $complianceCourse->id],
            [
                'course_title' => $complianceCourse->title,
                'issued_at' => Carbon::parse('2026-04-17 09:00:00', 'UTC'),
                'verification_code' => 'BETO-CERT-9132',
                'revoked' => false,
                'revoked_at' => null,
            ]
        );

        Notification::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'audience' => 'Admin', 'type' => 'billing'],
            [
                'message' => 'Seat utilization has reached 82% of the active plan limit.',
                'created_at' => Carbon::parse('2026-04-24 07:00:00', 'UTC'),
                'updated_at' => Carbon::parse('2026-04-24 07:00:00', 'UTC'),
            ]
        );

        Notification::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'audience' => 'Student', 'type' => 'live-class'],
            [
                'message' => 'Weekly Compliance Q&A starts tomorrow at 12:00 UTC.',
                'created_at' => Carbon::parse('2026-04-24 08:00:00', 'UTC'),
                'updated_at' => Carbon::parse('2026-04-24 08:00:00', 'UTC'),
            ]
        );

        AuditEvent::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'actor' => 'Ayesha Rahman', 'action' => 'Updated tenant branding colors'],
            [
                'target' => 'Betopia Academy',
                'ip_address' => '103.92.45.8',
                'created_at' => Carbon::parse('2026-04-23 10:00:00', 'UTC'),
                'updated_at' => Carbon::parse('2026-04-23 10:00:00', 'UTC'),
            ]
        );

        AuditEvent::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'actor' => 'Nafis Hasan', 'action' => 'Published assessment draft'],
            [
                'target' => 'Compliance Readiness Quiz',
                'ip_address' => '103.92.45.14',
                'created_at' => Carbon::parse('2026-04-24 06:00:00', 'UTC'),
                'updated_at' => Carbon::parse('2026-04-24 06:00:00', 'UTC'),
            ]
        );

        ComplianceRecord::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'user_id' => $studentRafi->id, 'course_id' => $complianceCourse->id],
            [
                'employee_name' => 'Rafi Khan',
                'department' => 'Product',
                'role_title' => 'Product Analyst',
                'course_title' => $complianceCourse->title,
                'completion_percent' => 82,
                'certified' => false,
            ]
        );

        ComplianceRecord::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'user_id' => $studentMaya->id, 'course_id' => $complianceCourse->id],
            [
                'employee_name' => 'Maya Sultana',
                'department' => 'Compliance',
                'role_title' => 'Compliance Associate',
                'course_title' => $complianceCourse->title,
                'completion_percent' => 100,
                'certified' => true,
            ]
        );

        ComplianceRecord::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'user_id' => $teacher->id, 'course_id' => $aiCourse->id],
            [
                'employee_name' => 'Nafis Hasan',
                'department' => 'Faculty',
                'role_title' => 'Senior Instructor',
                'course_title' => $aiCourse->title,
                'completion_percent' => 94,
                'certified' => true,
            ]
        );
    }
}
