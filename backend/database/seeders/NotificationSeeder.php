<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Invoice;
use App\Models\LiveClass;
use App\Models\Notification;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::query()->orderBy('id')->each(function (Tenant $tenant): void {
            $course = Course::query()->where('tenant_id', $tenant->id)->where('status', 'published')->orderBy('id')->first();
            $liveClass = LiveClass::query()->whereHas('course', fn ($query) => $query->where('tenant_id', $tenant->id))->orderBy('id')->first();
            $certificate = Certificate::query()->whereHas('course', fn ($query) => $query->where('tenant_id', $tenant->id))->orderBy('id')->first();
            $invoice = Invoice::query()->where('tenant_id', $tenant->id)->latest('issued_at')->first();

            $messages = [
                ['audience' => 'Teacher', 'type' => 'system', 'message' => sprintf('Course "%s" has been published for learners.', $course?->title ?? 'your selected course')],
                ['audience' => 'Teacher', 'type' => 'assessment', 'message' => sprintf('AI quiz drafts are ready for "%s".', $course?->title ?? 'the current course')],
                ['audience' => 'Teacher', 'type' => 'assessment', 'message' => 'A new assignment submission is waiting for review.'],
                ['audience' => 'Student', 'type' => 'live-class', 'message' => sprintf('Reminder: "%s" starts within 24 hours.', $liveClass?->title ?? 'your live class')],
                ['audience' => 'Student', 'type' => 'system', 'message' => sprintf('Certificate issued: %s', $certificate?->certificate_number ?? 'certificate available')],
                ['audience' => 'Admin', 'type' => 'billing', 'message' => sprintf('Billing alert: invoice %s is %s.', $invoice?->invoice_number ?? 'invoice', $invoice?->payment_status ?? 'pending')],
            ];

            foreach ($messages as $index => $message) {
                Notification::query()->create([
                    'tenant_id' => $tenant->id,
                    'audience' => $message['audience'],
                    'type' => $message['type'],
                    'message' => $message['message'],
                    'created_at' => Carbon::now()->subHours(($tenant->id * 2) + $index),
                    'updated_at' => Carbon::now()->subHours(($tenant->id * 2) + $index),
                ]);
            }
        });
    }
}
