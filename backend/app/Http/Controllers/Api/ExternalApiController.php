<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExternalApiController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'message' => 'Professional API access enabled.',
            'data' => [
                'tenant_id' => $user?->tenant_id,
                'user_id' => $user?->id,
                'status' => 'ok',
            ],
        ]);
    }
}
