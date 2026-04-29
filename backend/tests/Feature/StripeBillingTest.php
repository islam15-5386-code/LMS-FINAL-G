<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StripeBillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        config()->set('services.stripe.secret', 'sk_test_123');
        config()->set('services.stripe.price_id', 'price_test_123');
        config()->set('services.stripe.webhook_secret', 'whsec_test');
    }

    public function test_checkout_session_create(): void
    {
        Http::fake([
            'https://api.stripe.com/v1/checkout/sessions' => Http::response([
                'id' => 'cs_test_1',
                'url' => 'https://checkout.stripe.com/c/pay/cs_test_1',
            ], 200),
        ]);

        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/payments/stripe/checkout-session', ['plan' => 'Growth']);

        $response->assertCreated()->assertJsonPath('data.id', 'cs_test_1');
        $this->assertDatabaseHas('invoices', [
            'tenant_id' => $admin->tenant_id,
            'checkout_session_id' => 'cs_test_1',
            'payment_status' => 'pending',
            'provider' => 'stripe',
        ]);
    }

    public function test_webhook_success_and_duplicate_is_idempotent(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        $invoice = Invoice::query()->create([
            'tenant_id' => $admin->tenant_id,
            'invoice_number' => 'INV-TEST-1',
            'amount_bdt' => 100,
            'billing_period' => now()->format('F Y'),
            'issued_at' => now(),
            'due_at' => now()->addDays(10),
            'payment_status' => 'pending',
            'provider' => 'stripe',
            'provider_invoice_id' => 'in_test_1',
        ]);

        $payload = json_encode([
            'id' => 'evt_paid_1',
            'type' => 'invoice.paid',
            'data' => ['object' => ['id' => 'in_test_1', 'subscription' => 'sub_test_1']],
        ], JSON_THROW_ON_ERROR);

        $sig = $this->signatureForPayload($payload);

        $this->call(
            'POST',
            '/api/v1/payments/stripe/webhook',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => $sig],
            $payload
        )->assertOk();

        $invoice->refresh();
        $this->assertSame('paid', $invoice->payment_status);

        $this->call(
            'POST',
            '/api/v1/payments/stripe/webhook',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => $sig],
            $payload
        )->assertOk();

        $this->assertDatabaseCount('stripe_webhook_events', 1);
    }

    public function test_webhook_failed_payment_and_invalid_signature_rejected(): void
    {
        $admin = User::query()->where('role', 'admin')->firstOrFail();
        Invoice::query()->create([
            'tenant_id' => $admin->tenant_id,
            'invoice_number' => 'INV-TEST-2',
            'amount_bdt' => 100,
            'billing_period' => now()->format('F Y'),
            'issued_at' => now(),
            'due_at' => now()->addDays(10),
            'payment_status' => 'pending',
            'provider' => 'stripe',
            'provider_invoice_id' => 'in_test_2',
        ]);

        $bad = $this->call(
            'POST',
            '/api/v1/payments/stripe/webhook',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => 't=1,v1=invalid'],
            '{"id":"evt_bad"}'
        );
        $bad->assertStatus(400);

        $payload = json_encode([
            'id' => 'evt_failed_1',
            'type' => 'invoice.payment_failed',
            'data' => ['object' => ['id' => 'in_test_2', 'subscription' => 'sub_test_2']],
        ], JSON_THROW_ON_ERROR);

        $this->call(
            'POST',
            '/api/v1/payments/stripe/webhook',
            [],
            [],
            [],
            ['CONTENT_TYPE' => 'application/json', 'HTTP_STRIPE_SIGNATURE' => $this->signatureForPayload($payload)],
            $payload
        )->assertOk();

        $this->assertDatabaseHas('payment_failure_logs', ['reason' => 'invoice.payment_failed']);
        $this->assertDatabaseHas('invoices', ['provider_invoice_id' => 'in_test_2', 'payment_status' => 'failed']);
    }

    public function test_sslcommerz_fallback_still_works(): void
    {
        Http::fake([
            'https://sandbox.sslcommerz.com/gwprocess/v4/api.php' => Http::response([
                'status' => 'SUCCESS',
                'GatewayPageURL' => 'https://sandbox.sslcommerz.com/mock/checkout',
            ], 200),
        ]);

        config()->set('app.debug', true);
        config()->set('services.sslcommerz.sandbox', true);
        putenv('SSLCOMMERZ_IS_SANDBOX=true');

        $student = User::query()->where('role', 'student')->firstOrFail();
        $course = \App\Models\Course::query()->where('tenant_id', $student->tenant_id)->where('status', 'published')->firstOrFail();

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/payments/ssl/initiate', ['course_id' => $course->id]);

        $response->assertOk()->assertJsonStructure(['gateway_url']);
    }

    private function signatureForPayload(string $payload): string
    {
        $timestamp = (string) time();
        $mac = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test');
        return "t={$timestamp},v1={$mac}";
    }
}
