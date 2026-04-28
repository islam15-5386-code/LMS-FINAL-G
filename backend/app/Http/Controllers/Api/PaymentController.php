<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->role === 'admin', 403, 'Forbidden.');

        $payments = Payment::query()
            ->where('tenant_id', $user->tenant_id)
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('course_id'), fn ($query) => $query->where('course_id', $request->integer('course_id')))
            ->with(['user:id,name,email', 'course:id,title'])
            ->latest()
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'currentPage' => $payments->currentPage(),
                'lastPage' => $payments->lastPage(),
                'perPage' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user->role === 'student', 403, 'Forbidden. Only students can pay.');

        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'transaction_id' => ['required', 'string'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);
        // abort_if($course->tenant_id !== $user->tenant_id, 404, 'Resource not found.');
        abort_if($course->status !== 'published', 422, 'Only published courses can be enrolled from catalog.');

        // Verify amount
        abort_if($validated['amount'] < $course->price, 422, 'Insufficient amount.');

        $payment = Payment::create([
            'tenant_id' => $course->tenant_id,
            'user_id' => $user->id,
            'course_id' => $course->id,
            'amount' => $validated['amount'],
            'due_amount' => 0,
            'status' => 'paid',
            'transaction_id' => $validated['transaction_id'],
            'paid_at' => now(),
        ]);

        // Auto enroll the student
        $enrollment = Enrollment::firstOrCreate(
            [
                'tenant_id' => $course->tenant_id,
                'course_id' => $course->id,
                'student_id' => $user->id,
            ],
            [
                'status' => 'active',
                'progress_percentage' => 0,
                'enrolled_at' => now(),
            ]
        );

        if ($enrollment->wasRecentlyCreated) {
            $course->increment('enrollment_count');
            LmsSupport::audit($user, 'Enrolled in course via payment', $course->title);
        }

        LmsSupport::audit($user, 'Paid for course', $course->title);

        return response()->json([
            'data' => $payment->load(['course:id,title', 'user:id,name,email']),
        ], 201);
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_if($payment->tenant_id !== $user->tenant_id, 404, 'Resource not found.');
        abort_unless($user->role === 'admin' || $payment->user_id === $user->id, 403, 'Forbidden.');

        $payment->load(['user', 'course', 'tenant']);

        return response()->json([
            'data' => $payment,
        ]);
    }
}
