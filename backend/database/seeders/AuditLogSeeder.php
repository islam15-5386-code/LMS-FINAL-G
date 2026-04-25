<?php

namespace Database\Seeders;

use App\Models\AuditEvent;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::query()->orderBy('id')->each(function (Tenant $tenant): void {
            $admin = User::query()->where('tenant_id', $tenant->id)->where('role', 'admin')->first();
            $teacher = User::query()->where('tenant_id', $tenant->id)->where('role', 'teacher')->first();
            $student = User::query()->where('tenant_id', $tenant->id)->where('role', 'student')->first();
            $course = Course::query()->where('tenant_id', $tenant->id)->orderBy('id')->first();
            $certificate = Certificate::query()->whereHas('course', fn ($query) => $query->where('tenant_id', $tenant->id))->first();
            $invoice = Invoice::query()->where('tenant_id', $tenant->id)->latest('issued_at')->first();

            $events = [
                [$admin?->name ?? 'Institute Admin', 'user_created', $student?->name ?? 'Student record'],
                [$admin?->name ?? 'Institute Admin', 'course_published', $course?->title ?? 'Course'],
                [$teacher?->name ?? 'Faculty', 'assessment_generated', ($course?->title ?? 'Course') . ' assessment'],
                [$teacher?->name ?? 'Faculty', 'live_class_scheduled', ($course?->title ?? 'Course') . ' session'],
                [$admin?->name ?? 'Institute Admin', 'billing_updated', $invoice?->invoice_number ?? 'Billing profile'],
                [$admin?->name ?? 'Institute Admin', 'certificate_revoked', $certificate?->certificate_number ?? 'Certificate'],
                [$teacher?->name ?? 'Faculty', 'submission_reviewed', $student?->name ?? 'Learner submission'],
                [$admin?->name ?? 'Institute Admin', 'tenant_settings_updated', $tenant->name],
            ];

            foreach ($events as $index => [$actor, $action, $target]) {
                AuditEvent::query()->create([
                    'tenant_id' => $tenant->id,
                    'actor' => $actor,
                    'action' => $action,
                    'target' => $target,
                    'ip_address' => '103.10.' . ($tenant->id + 10) . '.' . ($index + 20),
                    'created_at' => Carbon::now()->subDays($tenant->id)->subHours($index),
                    'updated_at' => Carbon::now()->subDays($tenant->id)->subHours($index),
                ]);
            }
        });
    }
}
