<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SslCommerzPaymentController extends Controller
{
    public function initiate(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
        ]);

        $course = Course::findOrFail($validated['course_id']);
        $tran_id = 'SSL' . uniqid();

        // Create a pending payment
        $payment = Payment::create([
            'tenant_id' => $course->tenant_id,
            'user_id' => $user->id,
            'course_id' => $course->id,
            'amount' => $course->price,
            'due_amount' => 0,
            'status' => 'pending',
            'transaction_id' => $tran_id,
        ]);

        $post_data = [
            'store_id' => env('SSLCOMMERZ_STORE_ID'),
            'store_passwd' => env('SSLCOMMERZ_STORE_PASSWORD'),
            'total_amount' => $course->price,
            'currency' => 'BDT',
            'tran_id' => $tran_id,
            'success_url' => env('SSLCOMMERZ_SUCCESS_URL'),
            'fail_url' => env('SSLCOMMERZ_FAIL_URL'),
            'cancel_url' => env('SSLCOMMERZ_CANCEL_URL'),
            'ipn_url' => env('SSLCOMMERZ_IPN_URL'),
            'cus_name' => $user->name,
            'cus_email' => $user->email,
            'cus_add1' => 'Dhaka',
            'cus_city' => 'Dhaka',
            'cus_country' => 'Bangladesh',
            'cus_phone' => '01711111111',
            'shipping_method' => 'NO',
            'product_name' => $course->title,
            'product_category' => 'Education',
            'product_profile' => 'non-physical-goods',
        ];

        $mode = env('SSLCOMMERZ_IS_SANDBOX') ? 'sandbox' : 'securepay';
        $direct_api_url = "https://{$mode}.sslcommerz.com/gwprocess/v4/api.php";

        $response = Http::asForm()->post($direct_api_url, $post_data);
        $result = $response->json();

        if (isset($result['status']) && $result['status'] === 'SUCCESS') {
            return response()->json([
                'status' => 'success',
                'gateway_url' => $result['GatewayPageURL']
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $result['failedreason'] ?? 'Could not initiate payment.'
        ], 422);
    }

    public function success(Request $request)
    {
        $tran_id = $request->input('tran_id');
        $val_id = $request->input('val_id');
        $amount = $request->input('amount');
        $currency = $request->input('currency');

        if (!$val_id) {
            return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/student/dashboard?payment=invalid');
        }

        // Verify payment with SSLCommerz
        $mode = env('SSLCOMMERZ_IS_SANDBOX') ? 'sandbox' : 'securepay';
        $validation_url = "https://{$mode}.sslcommerz.com/validator/api/validationserverAPI.php";
        
        $response = Http::get($validation_url, [
            'val_id' => $val_id,
            'store_id' => env('SSLCOMMERZ_STORE_ID'),
            'store_passwd' => env('SSLCOMMERZ_STORE_PASSWORD'),
            'format' => 'json'
        ]);
        
        $result = $response->json();

        if (isset($result['status']) && ($result['status'] === 'VALID' || $result['status'] === 'VALIDATED')) {
            $payment = Payment::where('transaction_id', $tran_id)->first();

            if (!$payment) {
                // Should not happen if initiate was called
                Log::error("Payment not found for transaction: {$tran_id}");
                return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/student/dashboard?error=payment_not_found');
            }

            if ($payment->status !== 'paid') {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'transaction_id' => $result['bank_tran_id'] ?? $tran_id, // Use bank tran id if available
                ]);

                // Auto enroll
                $course = $payment->course;
                $user = $payment->user;

                $enrollment = Enrollment::updateOrCreate(
                    [
                        'tenant_id' => $payment->tenant_id,
                        'course_id' => $payment->course_id,
                        'student_id' => $payment->user_id,
                    ],
                    [
                        'status' => 'active',
                        'progress_percentage' => 0,
                        'enrolled_at' => now(),
                    ]
                );

                if ($enrollment->wasRecentlyCreated) {
                    $course->increment('enrollment_count');
                }
                
                LmsSupport::audit($user, 'Paid and Enrolled via SSLCommerz', $course->title);
            }

            return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . "/student/invoice/{$payment->id}");
        }

        return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/student/dashboard?payment=failed_validation');
    }

    public function fail(Request $request)
    {
        return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/student/dashboard?payment=failed');
    }

    public function cancel(Request $request)
    {
        return redirect()->away(env('FRONTEND_URL', 'http://localhost:3000') . '/student/dashboard?payment=cancelled');
    }

    public function ipn(Request $request)
    {
        // Handle IPN if needed
        return response()->json(['status' => 'ok']);
    }
}
