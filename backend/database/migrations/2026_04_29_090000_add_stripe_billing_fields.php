<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            if (! Schema::hasColumn('invoices', 'provider')) {
                $table->string('provider')->default('manual')->after('payment_status');
            }
            if (! Schema::hasColumn('invoices', 'provider_invoice_id')) {
                $table->string('provider_invoice_id')->nullable()->index()->after('provider');
            }
            if (! Schema::hasColumn('invoices', 'checkout_session_id')) {
                $table->string('checkout_session_id')->nullable()->index()->after('provider_invoice_id');
            }
            if (! Schema::hasColumn('invoices', 'metadata')) {
                $table->json('metadata')->nullable()->after('checkout_session_id');
            }
        });

        Schema::table('tenant_subscriptions', function (Blueprint $table): void {
            if (! Schema::hasColumn('tenant_subscriptions', 'stripe_customer_id')) {
                $table->string('stripe_customer_id')->nullable()->after('stripe_subscription_id');
            }
            if (! Schema::hasColumn('tenant_subscriptions', 'provider')) {
                $table->string('provider')->default('stripe')->after('stripe_customer_id');
            }
        });

        Schema::create('stripe_webhook_events', function (Blueprint $table): void {
            $table->id();
            $table->string('event_id')->unique();
            $table->string('event_type');
            $table->json('payload');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payment_failure_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->string('provider')->default('stripe');
            $table->text('reason');
            $table->json('context')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_failure_logs');
        Schema::dropIfExists('stripe_webhook_events');

        Schema::table('tenant_subscriptions', function (Blueprint $table): void {
            $drop = [];
            if (Schema::hasColumn('tenant_subscriptions', 'stripe_customer_id')) {
                $drop[] = 'stripe_customer_id';
            }
            if (Schema::hasColumn('tenant_subscriptions', 'provider')) {
                $drop[] = 'provider';
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });

        Schema::table('invoices', function (Blueprint $table): void {
            $drop = [];
            foreach (['provider', 'provider_invoice_id', 'checkout_session_id', 'metadata'] as $column) {
                if (Schema::hasColumn('invoices', $column)) {
                    $drop[] = $column;
                }
            }
            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};
