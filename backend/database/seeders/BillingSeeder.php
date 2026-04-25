<?php

namespace Database\Seeders;

use App\Models\BillingProfile;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Tenant;
use Database\Seeders\Support\BangladeshLmsDataset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class BillingSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            'Starter' => ['price' => 4900, 'seat_limit' => 100],
            'Growth' => ['price' => 14900, 'seat_limit' => 500],
            'Professional' => ['price' => 34900, 'seat_limit' => 2000],
        ];

        Tenant::query()->orderBy('id')->each(function (Tenant $tenant, int $tenantIndex) use ($plans): void {
            $plan = $plans[$tenant->plan_type] ?? $plans['Growth'];
            $usedSeats = Enrollment::query()
                ->where('tenant_id', $tenant->id)
                ->whereIn('status', ['active', 'completed', 'pending'])
                ->distinct('student_id')
                ->count('student_id');

            $billingStatus = match ($tenant->status) {
                'past_due' => 'pending',
                'trial' => 'pending',
                default => ($tenantIndex % 7 === 0 ? 'failed' : 'paid'),
            };

            $billingProfile = BillingProfile::query()->updateOrCreate(
                ['tenant_id' => $tenant->id],
                [
                    'plan' => $tenant->plan_type,
                    'active_students' => $usedSeats,
                    'used_seats' => $usedSeats,
                    'monthly_price' => $plan['price'],
                    'seat_limit' => $plan['seat_limit'],
                    'overage_per_seat' => match ($tenant->plan_type) {
                        'Starter' => 80,
                        'Professional' => 35,
                        default => 50,
                    },
                    'billing_status' => $billingStatus,
                    'next_billing_at' => Carbon::now()->addMonth()->startOfMonth(),
                ]
            );

            for ($invoiceIndex = 0; $invoiceIndex < 4; $invoiceIndex++) {
                $issuedAt = Carbon::now()->startOfMonth()->subMonths(3 - $invoiceIndex)->addDays(1);
                $paymentStatus = $invoiceIndex === 3 ? $billingStatus : 'paid';

                Invoice::query()->updateOrCreate(
                    [
                        'invoice_number' => BangladeshLmsDataset::invoiceNumber($tenant->subdomain, ($tenantIndex * 10) + $invoiceIndex),
                    ],
                    [
                        'tenant_id' => $tenant->id,
                        'billing_profile_id' => $billingProfile->id,
                        'amount_bdt' => $plan['price'],
                        'billing_period' => $issuedAt->format('F Y'),
                        'issued_at' => $issuedAt,
                        'due_at' => (clone $issuedAt)->addDays(10),
                        'paid_at' => $paymentStatus === 'paid' ? (clone $issuedAt)->addDays(4) : null,
                        'payment_status' => $paymentStatus,
                    ]
                );
            }
        });
    }
}
