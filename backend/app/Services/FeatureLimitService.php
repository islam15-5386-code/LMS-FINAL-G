<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\LiveClassParticipant;
use App\Models\TenantSubscription;
use App\Models\User;

class FeatureLimitService
{
    public function check(User $user, string $feature, array $context = []): array
    {
        $plan = $this->resolvePlanName($user);
        $capabilities = $this->planCapabilities($plan);

        if ($feature === 'ai_access') {
            if (! ($capabilities['ai_access'] ?? false)) {
                return $this->deny('ai_access', 'Standard');
            }

            $limit = $capabilities['ai_generation_limit'] ?? null;
            if (is_int($limit) && $limit > 0) {
                $count = Assessment::query()
                    ->whereHas('course', fn ($query) => $query->where('tenant_id', $user->tenant_id))
                    ->where('ai_generated', true)
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->count();
                if ($count >= $limit) {
                    return $this->deny('ai_access', 'Professional');
                }
            }

            return $this->allow();
        }

        if ($feature === 'api_access') {
            if (! ($capabilities['api_access'] ?? false)) {
                return $this->deny('api_access', 'Professional');
            }
            return $this->allow();
        }

        if ($feature === 'live_class_participant_cap') {
            $liveClass = $context['live_class'] ?? null;
            if ($liveClass === null) {
                return $this->allow();
            }

            $cap = (int) ($capabilities['live_limit'] ?? 0);
            $participantCount = LiveClassParticipant::query()
                ->where('tenant_id', $user->tenant_id)
                ->where('live_class_id', $liveClass->id)
                ->count();

            if ($participantCount >= $cap || $participantCount >= (int) $liveClass->participant_limit) {
                return $this->deny('live_class_participant_cap', 'Professional', 'Participant limit exceeded for your current plan.');
            }

            return $this->allow();
        }

        return $this->allow();
    }

    public function resolvePlanName(User $user): string
    {
        $subscription = TenantSubscription::query()
            ->with('plan:id,name')
            ->where('tenant_id', $user->tenant_id)
            ->whereIn('status', ['active', 'pending'])
            ->latest('id')
            ->first();

        $raw = (string) ($subscription?->plan?->name ?: ($user->tenant?->plan_type ?? 'Starter'));
        return match (strtolower($raw)) {
            'basic' => 'Starter',
            'standard' => 'Growth',
            default => in_array($raw, ['Starter', 'Growth', 'Professional'], true) ? $raw : 'Starter',
        };
    }

    public function planCapabilities(string $plan): array
    {
        $plans = config('lms.plans', []);
        return $plans[$plan] ?? $plans['Starter'] ?? [
            'ai_access' => false,
            'ai_generation_limit' => 0,
            'live_limit' => 0,
            'api_access' => false,
        ];
    }

    private function allow(): array
    {
        return ['allowed' => true];
    }

    private function deny(string $feature, string $requiredPlan, ?string $message = null): array
    {
        return [
            'allowed' => false,
            'message' => $message ?: 'Your current plan does not allow this feature.',
            'feature' => $feature,
            'required_plan' => $requiredPlan,
        ];
    }
}
