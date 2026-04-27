<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\AssessmentQuestion;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Submission;
use Database\Seeders\Support\BangladeshLmsDataset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = collect(BangladeshLmsDataset::courseCatalog())->keyBy('title');
        $certificateCounter = 1;

        Course::query()
            ->with(['tenant', 'teacher', 'enrollments.student'])
            ->orderBy('id')
            ->get()
            ->each(function (Course $course, int $courseIndex) use ($catalog, &$certificateCounter): void {
                $template = $catalog->get($course->title);
                if ($template === null) {
                    return;
                }

                $assessmentTypes = ['MCQ', 'True/False', 'Short Answer', 'Essay'];
                $assessmentCount = 10;

                for ($assessmentIndex = 0; $assessmentIndex < $assessmentCount; $assessmentIndex++) {
                    $type = $assessmentTypes[($courseIndex + $assessmentIndex) % count($assessmentTypes)];
                    $title = $assessmentIndex === 0
                        ? $course->title . ' Progress Assessment'
                        : $course->title . ' Final Evaluation';

                    $assessment = Assessment::query()->updateOrCreate(
                        [
                            'course_id' => $course->id,
                            'title' => $title,
                        ],
                        [
                            'type' => $type,
                            'status' => $course->status === 'published' ? 'published' : 'draft',
                            'generated_from' => 'AI-assisted instructor workflow',
                            'ai_generated' => true,
                            'question_count' => in_array($type, ['Essay', 'Short Answer'], true) ? 3 : 5,
                            'passing_mark' => $type === 'Essay' ? 60 : 50,
                            'total_marks' => 100,
                            'rubric_keywords' => $template['keywords'],
                            'teacher_reviewed' => $course->status === 'published',
                        ]
                    );

                    $this->seedQuestions($assessment, $template['keywords']);
                    $this->seedSubmissionsAndCertificates($course, $assessment, $certificateCounter);
                }
            });
    }

    private function seedQuestions(Assessment $assessment, array $keywords): void
    {
        $questionCount = $assessment->question_count;

        for ($questionIndex = 0; $questionIndex < $questionCount; $questionIndex++) {
            $keyword = $keywords[$questionIndex % count($keywords)];

            $question = $this->buildQuestionPayload($assessment->type, $keyword, $questionIndex + 1);

            AssessmentQuestion::query()->updateOrCreate(
                [
                    'assessment_id' => $assessment->id,
                    'position' => $questionIndex + 1,
                ],
                $question
            );
        }
    }

    private function seedSubmissionsAndCertificates(Course $course, Assessment $assessment, int &$certificateCounter): void
    {
        $eligibleEnrollments = $course->enrollments
            ->whereIn('status', ['active', 'completed'])
            ->values();

        $submissionCount = (int) ceil($eligibleEnrollments->count() * 0.6);

        $eligibleEnrollments->take($submissionCount)->each(function (Enrollment $enrollment, int $submissionIndex) use ($course, $assessment, &$certificateCounter): void {
            $score = $this->scoreForEnrollment($enrollment->progress_percentage, $submissionIndex);
            $passed = $score >= $assessment->passing_mark;
            $status = match (($submissionIndex + $assessment->id) % 4) {
                0 => 'graded',
                1 => 'submitted',
                2 => 'pending_review',
                default => 'graded',
            };

            Submission::query()->updateOrCreate(
                [
                    'assessment_id' => $assessment->id,
                    'user_id' => $enrollment->student_id,
                ],
                [
                    'answer_text' => $this->answerText($assessment->type, $assessment->rubric_keywords ?? []),
                    'status' => $status,
                    'score' => $score,
                    'feedback' => $passed
                        ? 'Strong understanding shown across the main learning outcomes.'
                        : 'Needs more detail on the practical workflow and key course concepts.',
                    'ai_feedback' => $passed
                        ? 'AI review suggests the learner aligned the answer with expected keywords.'
                        : 'AI review suggests revisiting the lesson materials and adding more context.',
                    'teacher_feedback' => $status === 'pending_review'
                        ? null
                        : ($passed ? 'Good work. Ready for the next milestone.' : 'Please revise and resubmit with examples.'),
                    'passed' => $passed,
                    'submitted_at' => Carbon::now()->subDays(($assessment->id + $submissionIndex) % 45),
                ]
            );

            if ($enrollment->status === 'completed' && $passed) {
                Certificate::query()->firstOrCreate(
                    [
                        'user_id' => $enrollment->student_id,
                        'course_id' => $course->id,
                    ],
                    [
                        'course_title' => $course->title,
                        'certificate_number' => BangladeshLmsDataset::certificateNumber($course->tenant->subdomain, $certificateCounter),
                        'issued_at' => $enrollment->completed_at ?? Carbon::now()->subDays(5),
                        'verification_code' => BangladeshLmsDataset::verificationCode($course->tenant->subdomain, $certificateCounter),
                        'status' => ($certificateCounter % 17 === 0) ? 'revoked' : 'active',
                        'revoked' => ($certificateCounter % 17 === 0),
                        'revoked_at' => ($certificateCounter % 17 === 0) ? Carbon::now()->subDays(1) : null,
                    ]
                );

                $certificateCounter++;
            }
        });
    }

    private function buildQuestionPayload(string $type, string $keyword, int $position): array
    {
        if ($type === 'True/False') {
            return [
                'prompt' => sprintf('True or False: %s is an important topic in this course workflow.', $keyword),
                'question_type' => $type,
                'options' => ['True', 'False'],
                'answer' => 'True',
                'rubric' => null,
                'sample_answer' => 'True',
            ];
        }

        if ($type === 'Short Answer') {
            return [
                'prompt' => sprintf('Briefly explain how %s supports the course outcome.', $keyword),
                'question_type' => $type,
                'options' => null,
                'answer' => $keyword,
                'rubric' => 'Mention the keyword, its practical use, and one benefit.',
                'sample_answer' => sprintf('%s supports the course outcome by improving practical task execution and learner confidence.', $keyword),
            ];
        }

        if ($type === 'Essay') {
            return [
                'prompt' => sprintf('Write a structured explanation on applying %s in a real Bangladeshi work or learning scenario.', $keyword),
                'question_type' => $type,
                'options' => null,
                'answer' => $keyword,
                'rubric' => 'Assess clarity, practical example, and correct use of terminology.',
                'sample_answer' => sprintf('A strong answer explains %s with a real office, institute, or project use case in Bangladesh.', $keyword),
            ];
        }

        return [
            'prompt' => sprintf('Which option best describes %s?', $keyword),
            'question_type' => 'MCQ',
            'options' => [
                $keyword . ' planning',
                $keyword . ' execution',
                $keyword . ' reporting',
                $keyword . ' governance',
            ],
            'answer' => $keyword . ' execution',
            'rubric' => null,
            'sample_answer' => $keyword . ' execution',
        ];
    }

    private function scoreForEnrollment(int $progress, int $submissionIndex): int
    {
        return max(35, min(98, $progress - 10 + (($submissionIndex * 9) % 25)));
    }

    private function answerText(string $type, array $keywords): string
    {
        $topicList = implode(', ', array_slice($keywords, 0, 3));

        return match ($type) {
            'Essay' => "This response explains {$topicList} using a practical Bangladeshi learning and workplace example with clear process steps.",
            'Short Answer' => "The learner connects {$topicList} to the course outcome and mentions the core benefit.",
            'True/False' => 'True',
            default => 'The correct option reflects the practical concept taught in the module.',
        };
    }
}
