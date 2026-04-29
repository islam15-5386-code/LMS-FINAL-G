<?php

namespace App\Http\Middleware;

use App\Services\FeatureLimitService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPlanLimit
{
    public function __construct(private readonly FeatureLimitService $featureLimitService)
    {
    }

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $check = $this->featureLimitService->check($user, $feature);
        if (! ($check['allowed'] ?? false)) {
            return response()->json([
                'message' => $check['message'],
                'feature' => $check['feature'],
                'required_plan' => $check['required_plan'],
            ], 403);
        }

        return $next($request);
    }
}
