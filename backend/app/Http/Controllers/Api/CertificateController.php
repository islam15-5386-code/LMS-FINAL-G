<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $certificates = Certificate::query()
            ->whereHas('course', fn ($query) => $query->where('tenant_id', $user->tenant_id))
            ->when($user->role === 'student', fn ($query) => $query->where('user_id', $user->id))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->with('user:id,name')
            ->latest('issued_at')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $certificates->getCollection()->map(fn (Certificate $certificate): array => LmsSupport::serializeCertificate($certificate))->all(),
            'meta' => [
                'currentPage' => $certificates->currentPage(),
                'lastPage' => $certificates->lastPage(),
                'perPage' => $certificates->perPage(),
                'total' => $certificates->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'course_id' => ['required', 'exists:courses,id'],
        ]);

        $student = User::query()->findOrFail($validated['user_id']);
        $course = Course::query()->findOrFail($validated['course_id']);

        abort_if($student->tenant_id !== $user->tenant_id || $course->tenant_id !== $user->tenant_id, 404, 'Resource not found.');

        $certificate = Certificate::query()->updateOrCreate(
            [
                'user_id' => $student->id,
                'course_id' => $course->id,
            ],
            [
                'course_title' => $course->title,
                'certificate_number' => LmsSupport::certificateNumber($student->id, $course->id),
                'issued_at' => now(),
                'verification_code' => LmsSupport::verificationCode(),
                'status' => 'active',
                'revoked' => false,
                'revoked_at' => null,
            ]
        );

        LmsSupport::audit($user, 'Issued certificate', $course->title, $request->ip());
        LmsSupport::notify($user->tenant, 'Student', 'system', sprintf('Certificate issued for "%s".', $course->title));

        try {
            if ($student->email) {
                Mail::raw(
                    "Congratulations {$student->name}!\n\nYou have been issued a certificate for completing '{$course->title}'.\n\nVerification Code: {$certificate->verification_code}",
                    function ($message) use ($student, $course) {
                        $message->to($student->email)->subject("Certificate Issued: {$course->title}");
                    }
                );
            }
        } catch (\Throwable $e) {
            // Ignore email failure
        }

        return response()->json([
            'message' => 'Certificate issued successfully.',
            'data' => LmsSupport::serializeCertificate($certificate->load('user:id,name')),
        ], 201);
    }

    public function revoke(Request $request, Certificate $certificate): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin']);

        abort_if($certificate->course?->tenant_id !== $user->tenant_id, 404, 'Certificate not found.');

        $certificate->update([
            'status' => 'revoked',
            'revoked' => true,
            'revoked_at' => now(),
        ]);

        LmsSupport::audit($user, 'Revoked certificate', $certificate->course_title, $request->ip());

        return response()->json([
            'message' => 'Certificate revoked successfully.',
            'data' => LmsSupport::serializeCertificate($certificate->fresh()->load('user:id,name')),
        ]);
    }

    public function verify(Request $request, Certificate $certificate): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin']);
        abort_if($certificate->course?->tenant_id !== $user->tenant_id, 404, 'Certificate not found.');
        $this->authorize('manage', $certificate);

        return response()->json([
            'data' => [
                ...LmsSupport::serializeCertificate($certificate->load('user:id,name')),
                'verified' => ! $certificate->revoked,
            ],
        ]);
    }
}
