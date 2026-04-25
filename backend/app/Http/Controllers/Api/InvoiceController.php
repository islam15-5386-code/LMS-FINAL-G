<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $invoices = Invoice::query()
            ->where('tenant_id', $user->tenant_id)
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')->toString()))
            ->latest('issued_at')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $invoices->getCollection()->map(fn (Invoice $invoice): array => LmsSupport::serializeInvoice($invoice))->all(),
            'meta' => [
                'currentPage' => $invoices->currentPage(),
                'lastPage' => $invoices->lastPage(),
                'perPage' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    public function show(Request $request, Invoice $invoice): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_if($invoice->tenant_id !== $user->tenant_id, 404, 'Invoice not found.');

        return response()->json([
            'data' => LmsSupport::serializeInvoice($invoice),
        ]);
    }
}
