<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BillingProfile;
use App\Models\Invoice;
use App\Services\StripeBillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripePaymentController extends Controller
{
    public function __construct(private readonly StripeBillingService $stripeBillingService)
    {
    }

    public function checkoutSession(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin']);
        $user->loadMissing('tenant.billingProfile');
        abort_if($user->tenant === null, 404, 'Tenant not found.');

        $validated = $request->validate([
            'plan' => ['nullable', 'in:Starter,Growth,Professional'],
            'success_url' => ['nullable', 'url'],
            'cancel_url' => ['nullable', 'url'],
        ]);

        $plan = $validated['plan'] ?? ($user->tenant->billingProfile?->plan ?? 'Starter');
        $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $session = $this->stripeBillingService->createCheckoutSession([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'plan' => $plan,
            'success_url' => $validated['success_url'] ?? "{$frontend}/admin/billing/success?session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => $validated['cancel_url'] ?? "{$frontend}/admin/billing/cancel",
        ]);

        $billingProfile = BillingProfile::query()->firstOrCreate(
            ['tenant_id' => $user->tenant_id],
            ['plan' => $plan, 'active_students' => 0, 'used_seats' => 0, 'monthly_price' => 0, 'seat_limit' => 0, 'overage_per_seat' => 0]
        );

        Invoice::query()->create([
            'tenant_id' => $user->tenant_id,
            'billing_profile_id' => $billingProfile->id,
            'invoice_number' => $this->stripeBillingService->makeInvoiceNumber((int) $user->tenant_id),
            'amount_bdt' => (float) ($billingProfile->monthly_price ?: 0),
            'billing_period' => now()->format('F Y'),
            'issued_at' => now(),
            'due_at' => now()->addDays(10),
            'payment_status' => 'pending',
            'provider' => 'stripe',
            'checkout_session_id' => (string) ($session['id'] ?? ''),
            'metadata' => ['plan' => $plan],
        ]);

        return response()->json([
            'message' => 'Stripe checkout session created.',
            'data' => [
                'id' => $session['id'] ?? null,
                'url' => $session['url'] ?? null,
            ],
        ], 201);
    }

    public function webhook(Request $request): JsonResponse
    {
        $signature = (string) $request->header('Stripe-Signature', '');
        $payload = (string) $request->getContent();

        if (! $this->stripeBillingService->verifyWebhookSignature($payload, $signature)) {
            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        }

        /** @var array<string,mixed> $event */
        $event = json_decode($payload, true) ?: [];
        $this->stripeBillingService->handleWebhookEvent($event);

        return response()->json(['received' => true]);
    }
}
