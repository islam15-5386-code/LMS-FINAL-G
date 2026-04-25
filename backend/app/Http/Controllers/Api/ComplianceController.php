<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComplianceRecord;
use App\Models\User;
use App\Support\LmsSupport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ComplianceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'teacher', 'hr_manager']);

        $records = $this->recordsQuery($user, $request)
            ->orderBy('employee_name')
            ->paginate($this->perPage($request));

        return response()->json([
            'data' => $records->getCollection()->map(fn (ComplianceRecord $record): array => LmsSupport::serializeComplianceRecord($record))->all(),
            'meta' => [
                'currentPage' => $records->currentPage(),
                'lastPage' => $records->lastPage(),
                'perPage' => $records->perPage(),
                'total' => $records->total(),
            ],
        ]);
    }

    public function exportCsv(Request $request)
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'teacher', 'hr_manager']);

        $records = $this->recordsQuery($user, $request)
            ->orderBy('employee_name')
            ->get();

        $csv = LmsSupport::generateCsv($records);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="compliance-report.csv"',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'teacher', 'hr_manager']);

        $records = $this->recordsQuery($user, $request)
            ->orderBy('employee_name')
            ->limit(30)
            ->get();

        $lines = $records->map(function (ComplianceRecord $record): string {
            return sprintf(
                '%s | %s | %s | %d%% | %s',
                $record->employee_name,
                $record->department,
                $record->course_title,
                $record->completion_percent,
                $record->certified ? 'Certified' : 'Pending'
            );
        })->all();

        $pdf = LmsSupport::generateSimplePdf('Compliance Report', $lines);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="compliance-report.pdf"',
        ]);
    }

    public function sendReminders(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['super_admin', 'admin', 'teacher', 'hr_manager']);

        $validated = $request->validate([
            'record_ids' => ['nullable', 'array'],
            'record_ids.*' => ['integer', 'exists:compliance_records,id'],
        ]);

        $records = $this->recordsQuery($user, $request)
            ->when(
                isset($validated['record_ids']),
                fn ($query) => $query->whereIn('id', $validated['record_ids']),
                fn ($query) => $query->where('certified', false)
            )
            ->with('user')
            ->get();

        $mailLog = [];

        foreach ($records as $record) {
            if ($record->user?->email === null) {
                $mailLog[] = [
                    'recordId' => $record->id,
                    'status' => 'skipped',
                    'reason' => 'Missing user email.',
                ];

                continue;
            }

            try {
                Mail::raw(
                    sprintf(
                        "Hello %s,\n\nThis is a reminder to complete %s. Your current completion is %d%%.\n\nPlease continue from your dashboard.",
                        $record->employee_name,
                        $record->course_title,
                        $record->completion_percent
                    ),
                    function ($message) use ($record): void {
                        $message
                            ->to($record->user?->email)
                            ->subject('Betopia LMS compliance reminder');
                    }
                );

                $mailLog[] = [
                    'recordId' => $record->id,
                    'status' => 'sent',
                    'email' => $record->user?->email,
                ];
            } catch (Throwable $exception) {
                $mailLog[] = [
                    'recordId' => $record->id,
                    'status' => 'failed',
                    'email' => $record->user?->email,
                    'reason' => $exception->getMessage(),
                ];
            }
        }

        LmsSupport::audit($user, 'Triggered compliance reminders', 'Compliance report', $request->ip());
        LmsSupport::notify($user->tenant, 'Admin', 'compliance', 'Compliance reminder emails were triggered from the dashboard.');

        return response()->json([
            'message' => 'Compliance reminder workflow completed.',
            'data' => [
                'mailer' => config('mail.default'),
                'results' => $mailLog,
            ],
        ]);
    }

    private function recordsQuery(User $user, Request $request)
    {
        return ComplianceRecord::query()
            ->where('tenant_id', $user->tenant_id)
            ->when(
                $request->filled('course_id'),
                fn ($query) => $query->where('course_id', $request->integer('course_id'))
            )
            ->when(
                $request->filled('certified'),
                fn ($query) => $query->where('certified', $request->boolean('certified'))
            );
    }
}
