<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use App\Support\DocumentTextExtractor;
use App\Support\LmsSupport;
use App\Services\FeatureLimitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssessmentController extends Controller
{
    public function __construct(private readonly FeatureLimitService $featureLimitService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $assessments = Assessment::query()
            ->whereHas('course', fn ($query) => $query->where('tenant_id', $user->tenant_id))
            ->with('questions')
            ->latest()
            ->get();

        return response()->json([
            'data' => $assessments->map(fn (Assessment $assessment): array => LmsSupport::serializeAssessment($assessment))->all(),
            'fallbackQuestionBank' => LmsSupport::fallbackQuestionBanks(),
        ]);
    }

    public function fallbackBanks(): JsonResponse
    {
        return response()->json([
            'data' => LmsSupport::fallbackQuestionBanks(),
        ]);
    }

    public function uploadNotes(Request $request): JsonResponse
    {
        $this->authorizeRoles($request, ['admin', 'teacher']);

        $validated = $request->validate([
            'note' => ['required', 'file', 'mimes:pdf,txt,doc,docx', 'max:10240'],
        ]);

        $file = $validated['note'];
        $path = $file->store('teacher-notes', 'local');
        $mimeType = $file->getMimeType() ?: 'application/octet-stream';
        $absolutePath = Storage::disk('local')->path($path);
        $extracted = DocumentTextExtractor::extract($absolutePath, $mimeType, $file->getClientOriginalName());

        return response()->json([
            'message' => 'Note uploaded successfully.',
            'data' => [
                'path' => $path,
                'fileName' => $file->getClientOriginalName(),
                'mimeType' => $mimeType,
                'size' => $file->getSize(),
                'preview' => $extracted['preview'],
                'extractedText' => $extracted['text'],
                'extractionMethod' => $extracted['extractionMethod'],
                'status' => $extracted['status'],
            ],
        ], 201);
    }

    public function generate(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'in:MCQ,True/False,Short Answer,Essay'],
            'question_count' => ['nullable', 'integer', 'min:1', 'max:50'],
            'source_text' => ['nullable', 'string'],
            'fallback_bank_id' => ['nullable', 'string'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);
        abort_if($course->tenant_id !== $user->tenant_id, 404, 'Course not found.');

        $resolvedSource = LmsSupport::resolveQuestionSource(
            $validated['source_text'] ?? null,
            $validated['fallback_bank_id'] ?? null,
        );

        $questionCount = $validated['question_count'] ?? 6;
        $generatedQuestions = LmsSupport::generateAiQuestions($resolvedSource['source_text'], $validated['type'], $questionCount);
        $rubricKeywords = LmsSupport::rubricKeywordsFromSource($resolvedSource['source_text']);

        $assessment = DB::transaction(function () use ($course, $validated, $resolvedSource, $generatedQuestions, $rubricKeywords): Assessment {
            $assessment = Assessment::query()->create([
                'course_id' => $course->id,
                'title' => $validated['title'] ?? ($course->title . ' Generated Assessment'),
                'type' => $validated['type'],
                'status' => 'draft',
                'generated_from' => $resolvedSource['generated_from'],
                'ai_generated' => true,
                'question_count' => count($generatedQuestions),
                'passing_mark' => in_array($validated['type'], ['Essay', 'Short Answer'], true) ? 60 : 50,
                'total_marks' => 100,
                'rubric_keywords' => $rubricKeywords,
                'teacher_reviewed' => false,
            ]);

            foreach ($generatedQuestions as $index => $question) {
                $assessment->questions()->create([
                    'prompt' => $question['prompt'],
                    'question_type' => $validated['type'],
                    'options' => $question['options'],
                    'answer' => $question['answer'],
                    'rubric' => in_array($validated['type'], ['Essay', 'Short Answer'], true)
                        ? 'Assess concept clarity, relevant terminology, and practical application.'
                        : null,
                    'sample_answer' => $question['answer'],
                    'position' => $index + 1,
                ]);
            }

            return $assessment;
        });

        LmsSupport::audit($user, 'Generated assessment draft', $assessment->title, $request->ip());

        return response()->json([
            'message' => 'Assessment draft generated successfully.',
            'data' => LmsSupport::serializeAssessment($assessment->load('questions')),
        ], 201);
    }

    public function publish(Request $request, Assessment $assessment): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');

        $assessment->update([
            'status' => 'published',
            'teacher_reviewed' => true,
        ]);

        LmsSupport::audit($user, 'Published assessment', $assessment->title, $request->ip());
        LmsSupport::notify($user->tenant, 'Teacher', 'assessment', sprintf('Assessment "%s" is now published.', $assessment->title));

        return response()->json([
            'message' => 'Assessment published successfully.',
            'data' => LmsSupport::serializeAssessment($assessment->fresh()->load('questions')),
        ]);
    }

    public function show(Request $request, Assessment $assessment): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');

        return response()->json([
            'data' => LmsSupport::serializeAssessment($assessment->load('questions')),
        ]);
    }

    public function update(Request $request, Assessment $assessment): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:MCQ,True/False,Short Answer,Essay'],
            'passing_mark' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'total_marks' => ['sometimes', 'integer', 'min:1'],
        ]);

        $assessment->update($validated);

        LmsSupport::audit($user, 'Updated assessment', $assessment->title, $request->ip());

        return response()->json([
            'message' => 'Assessment updated successfully.',
            'data' => LmsSupport::serializeAssessment($assessment->fresh()->load('questions')),
        ]);
    }

    public function destroy(Request $request, Assessment $assessment): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);

        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');

        $title = $assessment->title;
        $assessment->delete();

        LmsSupport::audit($user, 'Deleted assessment', $title, $request->ip());

        return response()->json([
            'message' => 'Assessment deleted successfully.',
        ]);
    }

    public function updateQuestion(Request $request, Assessment $assessment, \App\Models\AssessmentQuestion $question): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');
        abort_if($question->assessment_id !== $assessment->id, 404, 'Question does not belong to this assessment.');

        $validated = $request->validate([
            'prompt' => ['sometimes', 'string'],
            'options' => ['sometimes', 'array'],
            'answer' => ['sometimes', 'string'],
        ]);

        $question->update($validated);

        return response()->json([
            'message' => 'Question updated successfully.',
            'data' => LmsSupport::serializeAssessmentQuestion($question),
        ]);
    }

    public function deleteQuestion(Request $request, Assessment $assessment, \App\Models\AssessmentQuestion $question): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');
        abort_if($question->assessment_id !== $assessment->id, 404, 'Question does not belong to this assessment.');

        $question->delete();

        $assessment->decrement('question_count');

        return response()->json([
            'message' => 'Question deleted successfully.',
        ]);
    }

    public function submit(Request $request, Assessment $assessment): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['student']);

        abort_if($assessment->course?->tenant_id !== $user->tenant_id, 404, 'Assessment not found.');

        $validated = $request->validate([
            'answer_text' => ['required', 'string'],
        ]);

        $result = in_array($assessment->type, ['Essay', 'Short Answer'], true)
            ? LmsSupport::evaluateEssay($validated['answer_text'], $assessment->rubric_keywords ?? [])
            : $this->scoreObjectiveAssessment($assessment, $validated['answer_text']);

        $submission = $assessment->submissions()->create([
            'user_id' => $user->id,
            'answer_text' => $validated['answer_text'],
            'status' => in_array($assessment->type, ['Essay', 'Short Answer'], true) ? 'pending_review' : 'graded',
            'score' => $result['score'],
            'feedback' => $result['feedback'],
            'ai_feedback' => $result['feedback'],
            'teacher_feedback' => in_array($assessment->type, ['Essay', 'Short Answer'], true) ? null : 'Objective assessment auto-graded successfully.',
            'passed' => $result['passed'],
            'submitted_at' => now(),
        ]);

        $certificate = null;

        if ($result['passed']) {
            $certificate = Certificate::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'course_id' => $assessment->course_id,
                ],
                [
                    'course_title' => $assessment->course?->title ?? 'Course Certificate',
                    'certificate_number' => LmsSupport::certificateNumber($user->id, $assessment->course_id),
                    'issued_at' => now(),
                    'verification_code' => LmsSupport::verificationCode(),
                    'status' => 'active',
                    'revoked' => false,
                ]
            );
        }

        if ($assessment->course !== null) {
            $assessment->course->complianceRecords()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'tenant_id' => $user->tenant_id,
                    'employee_name' => $user->name,
                    'department' => $user->department ?? 'General',
                    'role_title' => ucfirst($user->role),
                    'course_title' => $assessment->course->title,
                    'completion_percent' => $result['passed'] ? 100 : 65,
                    'certified' => $result['passed'],
                ]
            );
        }

        LmsSupport::audit($user, 'Submitted assessment', $assessment->title, $request->ip());

        return response()->json([
            'message' => 'Assessment submitted successfully.',
            'data' => [
                'submission' => LmsSupport::serializeSubmission($submission->load('user:id,name')),
                'certificate' => $certificate !== null ? LmsSupport::serializeCertificate($certificate->load('user:id,name')) : null,
            ],
        ], 201);
    }

    public function weaknessAnalyzer(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $gate = $this->featureLimitService->check($user, 'ai_access');
        if (! ($gate['allowed'] ?? false)) {
            return response()->json([
                'message' => $gate['message'],
                'feature' => $gate['feature'],
                'required_plan' => $gate['required_plan'],
            ], 403);
        }

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'course_id' => ['required', 'exists:courses,id'],
        ]);

        $student = User::query()->findOrFail($validated['student_id']);
        abort_if($student->tenant_id !== $user->tenant_id, 404, 'Student not found.');

        return response()->json([
            'message' => 'AI weakness analyzer completed.',
            'data' => [
                'studentId' => (string) $student->id,
                'courseId' => (string) $validated['course_id'],
                'weaknesses' => ['revision consistency', 'objective accuracy', 'time management'],
                'suggestion' => 'Assign two short-form quizzes and one essay revision this week.',
            ],
        ]);
    }

    public function aiStudyPlan(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher', 'student']);
        $gate = $this->featureLimitService->check($user, 'ai_access');
        if (! ($gate['allowed'] ?? false)) {
            return response()->json([
                'message' => $gate['message'],
                'feature' => $gate['feature'],
                'required_plan' => $gate['required_plan'],
            ], 403);
        }

        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'goal' => ['nullable', 'string', 'max:255'],
        ]);

        return response()->json([
            'message' => 'AI study plan generated.',
            'data' => [
                'courseId' => (string) $validated['course_id'],
                'goal' => (string) ($validated['goal'] ?? 'weekly mastery'),
                'plan' => [
                    'Day 1: watch module recap + objective quiz',
                    'Day 3: short-answer practice and rubric self-check',
                    'Day 5: timed assessment + revision loop',
                ],
            ],
        ]);
    }

    public function aiParentReport(Request $request): JsonResponse
    {
        $user = $this->authorizeRoles($request, ['admin', 'teacher']);
        $gate = $this->featureLimitService->check($user, 'ai_access');
        if (! ($gate['allowed'] ?? false)) {
            return response()->json([
                'message' => $gate['message'],
                'feature' => $gate['feature'],
                'required_plan' => $gate['required_plan'],
            ], 403);
        }

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ]);

        $student = User::query()->findOrFail($validated['student_id']);
        abort_if($student->tenant_id !== $user->tenant_id, 404, 'Student not found.');

        return response()->json([
            'message' => 'AI parent report generated.',
            'data' => [
                'studentId' => (string) $student->id,
                'summary' => 'Performance is stable with strong assignment completion and moderate quiz consistency.',
                'recommendation' => 'Increase live class participation and weekly reflective practice.',
            ],
        ]);
    }

    private function scoreObjectiveAssessment(Assessment $assessment, string $answerText): array
    {
        $assessment->loadMissing('questions');

        $answers = $assessment->questions
            ->pluck('answer')
            ->filter()
            ->map(fn (?string $answer): string => Str::lower((string) $answer))
            ->all();

        $normalizedAnswer = Str::lower($answerText);
        $passed = collect($answers)->contains(fn (string $answer): bool => Str::contains($normalizedAnswer, $answer));

        return [
            'score' => $passed ? 88 : 58,
            'passed' => $passed,
            'feedback' => $passed
                ? 'The submitted response aligns with the expected answer pattern.'
                : 'Review the source material again and align the response more closely to the assessment objectives.',
        ];
    }
}
