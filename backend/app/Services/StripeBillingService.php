<?php

namespace App\Services;

use App\Models\BillingProfile;
use App\Models\Invoice;
use App\Models\PaymentFailureLog;
use App\Models\StripeWebhookEvent;
use App\Models\TenantSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StripeBillingService
{
    public function createCheckoutSession(array $payload): array
    {
        $priceId = config('services.stripe.price_id');
        $secret = config('services.stripe.secret');

        if (! $priceId || ! $secret) {
            throw new HttpException(422, 'Stripe is not configured.');
        }

        $response = Http::asForm()
            ->withToken($secret)
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'subscription',
                'line_items[0][price]' => $priceId,
                'line_items[0][quantity]' => 1,
                'success_url' => $payload['success_url'],
                'cancel_url' => $payload['cancel_url'],
                'metadata[tenant_id]' => (string) $payload['tenant_id'],
                'metadata[user_id]' => (string) $payload['user_id'],
                'metadata[plan]' => (string) $payload['plan'],
            ]);

        if ($response->failed()) {
            throw new HttpException(422, 'Stripe checkout session could not be created.');
        }

        return $response->json();
    }

    public function verifyWebhookSignature(string $payload, string $signatureHeader): bool
    {
        $secret = (string) config('services.stripe.webhook_secret');
        if ($secret === '' || $signatureHeader === '') {
            return false;
        }

        $parts = [];
        foreach (explode(',', $signatureHeader) as $chunk) {
            [$key, $value] = array_pad(explode('=', $chunk, 2), 2, null);
            if ($key !== null && $value !== null) {
                $parts[trim($key)] = trim($value);
            }
        }

        $timestamp = $parts['t'] ?? null;
        $signature = $parts['v1'] ?? null;
        if (! $timestamp || ! $signature) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);
        return hash_equals($expected, $signature);
    }

    public function handleWebhookEvent(array $event): void
    {
        $eventId = (string) ($event['id'] ?? '');
        if ($eventId === '') {
            throw new HttpException(422, 'Invalid event payload.');
        }

        if (StripeWebhookEvent::query()->where('event_id', $eventId)->exists()) {
            return;
        }

        StripeWebhookEvent::query()->create([
            'event_id' => $eventId,
            'event_type' => (string) ($event['type'] ?? 'unknown'),
            'payload' => $event,
            'processed_at' => now(),
        ]);

        $object = (array) data_get($event, 'data.object', []);
        $type = (string) ($event['type'] ?? '');

        if ($type === 'checkout.session.completed') {
            $this->markCheckoutCompleted($object);
            return;
        }

        if ($type === 'invoice.paid') {
            $this->markInvoicePaid($object);
            return;
        }

        if (in_array($type, ['invoice.payment_failed', 'customer.subscription.deleted', 'customer.subscription.paused'], true)) {
            $this->markInvoiceFailed($object, $type);
        }
    }

    private function markCheckoutCompleted(array $session): void
    {
        $tenantId = (int) data_get($session, 'metadata.tenant_id');
        $plan = (string) data_get($session, 'metadata.plan', 'Starter');
        $customerId = data_get($session, 'customer');
        $subscriptionId = data_get($session, 'subscription');

        $billing = BillingProfile::query()->firstOrCreate(
            ['tenant_id' => $tenantId],
            ['plan' => $plan, 'monthly_price' => 0, 'seat_limit' => 0, 'overage_per_seat' => 0]
        );

        $invoice = Invoice::query()->where('checkout_session_id', data_get($session, 'id'))->first();
        if ($invoice !== null) {
            $invoice->update([
                'provider' => 'stripe',
                'payment_status' => 'pending',
                'provider_invoice_id' => data_get($session, 'invoice'),
                'metadata' => $session,
            ]);
        }

        $planId = (int) DB::table('subscription_plans')->value('id');
        if ($planId <= 0) {
            $planId = (int) DB::table('subscription_plans')->insertGetId([
                'name' => $plan,
                'price' => 0,
                'student_limit' => 0,
                'ai_access' => false,
                'live_class_limit' => 0,
                'white_label_enabled' => false,
                'overage_fee' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        TenantSubscription::query()->updateOrCreate(
            ['tenant_id' => $tenantId],
            [
                'plan_id' => $planId,
                'provider' => 'stripe',
                'stripe_customer_id' => $customerId,
                'stripe_subscription_id' => $subscriptionId,
                'status' => 'pending',
                'started_at' => now(),
            ]
        );

        $billing->update(['billing_status' => 'pending']);
    }

    private function markInvoicePaid(array $stripeInvoice): void
    {
        $providerInvoiceId = (string) ($stripeInvoice['id'] ?? '');
        $subscriptionId = (string) ($stripeInvoice['subscription'] ?? '');

        $invoice = Invoice::query()
            ->where('provider_invoice_id', $providerInvoiceId)
            ->latest('id')
            ->first();

        if ($invoice === null && $subscriptionId !== '') {
            $invoice = Invoice::query()
                ->where('provider', 'stripe')
                ->where('payment_status', 'pending')
                ->latest('id')
                ->first();
        }

        if ($invoice === null) {
            return;
        }

        $invoice->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
            'provider' => 'stripe',
            'metadata' => array_merge($invoice->metadata ?? [], ['stripe_invoice' => $stripeInvoice]),
        ]);

        BillingProfile::query()->where('tenant_id', $invoice->tenant_id)->update([
            'billing_status' => 'paid',
            'next_billing_at' => now()->addMonth()->startOfMonth(),
        ]);

        TenantSubscription::query()->where('tenant_id', $invoice->tenant_id)->update([
            'status' => 'active',
        ]);
    }

    private function markInvoiceFailed(array $object, string $eventType): void
    {
        $subscriptionId = (string) ($object['subscription'] ?? '');
        $providerInvoiceId = (string) ($object['id'] ?? '');

        $invoice = Invoice::query()
            ->where('provider_invoice_id', $providerInvoiceId)
            ->latest('id')
            ->first();

        if ($invoice === null && $subscriptionId !== '') {
            $invoice = Invoice::query()
                ->where('provider', 'stripe')
                ->whereIn('payment_status', ['pending', 'paid'])
                ->latest('id')
                ->first();
        }

        if ($invoice !== null) {
            $invoice->update([
                'payment_status' => 'failed',
                'provider' => 'stripe',
                'metadata' => array_merge($invoice->metadata ?? [], ['failure_event' => $eventType]),
            ]);

            BillingProfile::query()->where('tenant_id', $invoice->tenant_id)->update([
                'billing_status' => 'failed',
            ]);

            TenantSubscription::query()->where('tenant_id', $invoice->tenant_id)->update([
                'status' => in_array($eventType, ['customer.subscription.deleted', 'customer.subscription.paused'], true) ? 'canceled' : 'failed',
                'ends_at' => now(),
            ]);
        }

        PaymentFailureLog::query()->create([
            'tenant_id' => $invoice?->tenant_id,
            'invoice_id' => $invoice?->id,
            'provider' => 'stripe',
            'reason' => $eventType,
            'context' => $object,
        ]);
    }

    public function makeInvoiceNumber(int $tenantId): string
    {
        return sprintf('INV-%s-%s-%s', now()->format('Ym'), str_pad((string) $tenantId, 4, '0', STR_PAD_LEFT), Str::upper((string) Str::ulid()));
    }
}
