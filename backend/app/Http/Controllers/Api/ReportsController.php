<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportsController extends Controller
{
    /**
     * Return revenue aggregates for admin.
     * Query params: start (YYYY-MM-DD), end (YYYY-MM-DD)
     */
    public function revenue(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->role === 'admin', 403, 'Forbidden.');

        $end = $request->filled('end') ? Carbon::parse($request->string('end'))->endOfDay() : Carbon::now()->endOfDay();
        $start = $request->filled('start') ? Carbon::parse($request->string('start'))->startOfDay() : $end->copy()->subMonths(11)->startOfMonth();

        $paymentsQuery = Payment::query()
            ->where('tenant_id', $user->tenant_id)
            ->whereBetween('paid_at', [$start, $end])
            ->where('status', 'paid');

        $total = (float) $paymentsQuery->sum('amount');

        // Aggregate by month
        $byMonth = $paymentsQuery->selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as month, SUM(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($row) {
                return [
                    'month' => $row->month,
                    'total' => (float) $row->total,
                ];
            });

        return response()->json([
            'data' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
                'total' => $total,
                'by_month' => $byMonth,
            ],
        ]);
    }
}
