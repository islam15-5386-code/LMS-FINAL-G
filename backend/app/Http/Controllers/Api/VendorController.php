<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'hr_manager']);

        $vendors = Tenant::query()
            ->when(
                $user->role !== 'super_admin',
                fn ($query) => $query->where('id', $user->tenant_id)
            )
            ->when(
                $request->filled('search'),
                fn ($query) => $query->where(function ($inner) use ($request): void {
                    $search = '%' . $request->string('search')->toString() . '%';
                    $inner->where('name', 'like', $search)
                        ->orWhere('subdomain', 'like', $search)
                        ->orWhere('city', 'like', $search)
                        ->orWhere('support_email', 'like', $search);
                })
            )
            ->with(['users:id,tenant_id,is_active', 'courses:id,tenant_id,status', 'billingProfile:id,tenant_id,active_students,used_seats'])
            ->orderBy('name')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $vendors->getCollection()->map(fn (Tenant $tenant): array => LmsSupport::serializeVendorSummary($tenant))->all(),
            'meta' => [
                'currentPage' => $vendors->currentPage(),
                'lastPage' => $vendors->lastPage(),
                'perPage' => $vendors->perPage(),
                'total' => $vendors->total(),
            ],
        ]);
    }

    public function current(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'hr_manager'])->loadMissing('tenant.users:id,tenant_id,is_active', 'tenant.courses:id,tenant_id,status', 'tenant.billingProfile:id,tenant_id,active_students,used_seats');

        abort_if($user->tenant === null, 404, 'Vendor not found.');

        return response()->json([
            'data' => LmsSupport::serializeVendorSummary($user->tenant),
            'branding' => LmsSupport::serializeBranding($user->tenant),
        ]);
    }
}
