<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\CourseModule;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class CourseContentSeeder extends Seeder
{
    /** @var array<int, array<string, mixed>> */
    private array $videoLibrary = [
        [
            'topic' => 'html-css',
            'title' => 'HTML & CSS Full Course',
            'youtube_url' => 'https://www.youtube.com/watch?v=mU6anWqZJcc',
            'embed_url' => 'https://www.youtube.com/embed/mU6anWqZJcc',
            'duration' => 180,
        ],
        [
            'topic' => 'javascript',
            'title' => 'JavaScript Full Course for Beginners',
            'youtube_url' => 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
            'embed_url' => 'https://www.youtube.com/embed/PkZNo7MFNFg',
            'duration' => 205,
        ],
        [
            'topic' => 'react',
            'title' => 'React Course for Beginners',
            'youtube_url' => 'https://www.youtube.com/watch?v=bMknfKXIFA8',
            'embed_url' => 'https://www.youtube.com/embed/bMknfKXIFA8',
            'duration' => 720,
        ],
        [
            'topic' => 'node',
            'title' => 'Node.js and Express.js Full Course',
            'youtube_url' => 'https://www.youtube.com/watch?v=Oe421EPjeBE',
            'embed_url' => 'https://www.youtube.com/embed/Oe421EPjeBE',
            'duration' => 480,
        ],
        [
            'topic' => 'postgresql',
            'title' => 'PostgreSQL Full Course',
            'youtube_url' => 'https://www.youtube.com/watch?v=SpfIwlAYaKk',
            'embed_url' => 'https://www.youtube.com/embed/SpfIwlAYaKk',
            'duration' => 240,
        ],
        [
            'topic' => 'laravel',
            'title' => 'Laravel Course for Beginners',
            'youtube_url' => 'https://www.youtube.com/watch?v=ImtZ5yENzgE',
            'embed_url' => 'https://www.youtube.com/embed/ImtZ5yENzgE',
            'duration' => 240,
        ],
        [
            'topic' => 'flutter',
            'title' => 'Flutter Beginner Course',
            'youtube_url' => 'https://www.youtube.com/watch?v=VPvVD8t02U8',
            'embed_url' => 'https://www.youtube.com/embed/VPvVD8t02U8',
            'duration' => 220,
        ],
        [
            'topic' => 'ai',
            'title' => 'Machine Learning for Everybody',
            'youtube_url' => 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
            'embed_url' => 'https://www.youtube.com/embed/i_LwzRVP7bg',
            'duration' => 150,
        ],
        [
            'topic' => 'python',
            'title' => 'Python for Beginners',
            'youtube_url' => 'https://www.youtube.com/watch?v=rfscVS0vtbw',
            'embed_url' => 'https://www.youtube.com/embed/rfscVS0vtbw',
            'duration' => 250,
        ],
    ];

    /** @var array<int, array<string, mixed>> */
    private array $moduleBlueprints = [
        ['title' => 'Module 1: Foundation Concepts', 'desc' => 'Build the core concepts, tools, and workflow needed before starting implementation.', 'topic' => 'html-css'],
        ['title' => 'Module 2: Core Syntax and Logic', 'desc' => 'Understand practical syntax, control flow, and reusable patterns for project development.', 'topic' => 'javascript'],
        ['title' => 'Module 3: UI and Component Architecture', 'desc' => 'Design structured interfaces and compose reusable UI components for scalable products.', 'topic' => 'react'],
        ['title' => 'Module 4: API and Backend Integration', 'desc' => 'Connect frontend and backend through robust APIs and data contracts.', 'topic' => 'node'],
        ['title' => 'Module 5: Database Modeling and Queries', 'desc' => 'Plan schemas, model relationships, and optimize read/write operations for production systems.', 'topic' => 'postgresql'],
        ['title' => 'Module 6: Authentication and Security', 'desc' => 'Implement secure authentication, validation, authorization, and basic threat prevention.', 'topic' => 'laravel'],
        ['title' => 'Module 7: Testing and Quality Assurance', 'desc' => 'Apply automated testing, debugging, and quality control practices to maintain reliability.', 'topic' => 'python'],
        ['title' => 'Module 8: Deployment and Monitoring', 'desc' => 'Prepare release workflows, deployment steps, and monitoring strategy for live products.', 'topic' => 'ai'],
    ];

    public function run(): void
    {
        $courses = Course::query()->get();

        foreach ($courses as $course) {
            $this->seedCourseContent($course);
        }
    }

    private function seedCourseContent(Course $course): void
    {
        $moduleCount = 6;
        $lessonsPerModule = 4;

        Assessment::query()->where('course_id', $course->id)->each(function (Assessment $assessment): void {
            $assessment->questions()->delete();
            $assessment->delete();
        });

        $course->modules()->each(function (CourseModule $module): void {
            $module->lessons()->delete();
            $module->delete();
        });

        $selectedBlueprints = array_slice($this->moduleBlueprints, 0, $moduleCount);

        foreach ($selectedBlueprints as $moduleIndex => $blueprint) {
            $module = $course->modules()->create([
                'title' => $blueprint['title'],
                'description' => $blueprint['desc'],
                'drip_days' => $moduleIndex,
                'position' => $moduleIndex + 1,
            ]);

            for ($lessonIndex = 0; $lessonIndex < $lessonsPerModule; $lessonIndex += 1) {
                $lessonType = $lessonIndex === 2 ? 'quiz' : ($lessonIndex === 3 ? 'assignment' : 'video');
                $video = $this->pickVideoByTopic((string) $blueprint['topic'], $lessonIndex);

                $lessonTitle = match ($lessonType) {
                    'quiz' => sprintf('%s Quiz Checkpoint', $blueprint['title']),
                    'assignment' => sprintf('%s Practical Assignment', $blueprint['title']),
                    default => sprintf('%s Class %d: %s', $blueprint['title'], $lessonIndex + 1, $video['title']),
                };

                $lessonDescription = match ($lessonType) {
                    'quiz' => 'Answer objective questions to validate conceptual understanding before proceeding to the next module.',
                    'assignment' => 'Complete a hands-on task and submit implementation evidence aligned with this module objectives.',
                    default => 'Watch the guided class video and capture key implementation notes for practical application.',
                };

                $module->lessons()->create([
                    'title' => $lessonTitle,
                    'description' => $lessonDescription,
                    'type' => $lessonType,
                    'duration_minutes' => $lessonType === 'video' ? (int) $video['duration'] : ($lessonType === 'quiz' ? 25 : 60),
                    'content_url' => (string) $video['youtube_url'],
                    'youtube_url' => (string) $video['youtube_url'],
                    'embed_url' => (string) $video['embed_url'],
                    'content_mime' => 'video/youtube',
                    'content_original_name' => $lessonType === 'video' ? 'YouTube Class Video' : ucfirst($lessonType) . ' Resource',
                    'release_at' => Carbon::now()->addDays($moduleIndex),
                    'position' => $lessonIndex + 1,
                ]);
            }
        }

        $this->seedAssessments($course);
    }

    private function seedAssessments(Course $course): void
    {
        $assessmentSets = [
            [
                'title' => 'Course Midterm Assessment',
                'type' => 'MCQ',
                'generated_from' => 'Core module content and implementation workflows',
                'questions' => $this->mcqQuestions(),
            ],
            [
                'title' => 'Course Final Readiness Assessment',
                'type' => 'True/False',
                'generated_from' => 'Architecture, deployment, and quality assurance outcomes',
                'questions' => $this->trueFalseQuestions(),
            ],
        ];

        foreach ($assessmentSets as $assessmentIndex => $item) {
            $questions = array_slice($item['questions'], 0, 6);

            $assessment = $course->assessments()->create([
                'title' => $item['title'],
                'type' => $item['type'],
                'status' => 'published',
                'generated_from' => $item['generated_from'],
                'ai_generated' => false,
                'question_count' => count($questions),
                'passing_mark' => 60,
                'total_marks' => 100,
                'rubric_keywords' => ['architecture', 'programming', 'testing', 'deployment'],
                'teacher_reviewed' => true,
            ]);

            foreach ($questions as $index => $question) {
                $assessment->questions()->create([
                    'prompt' => $question['question_text'],
                    'question_type' => $item['type'],
                    'options' => $question['options'],
                    'answer' => $question['correct_answer'],
                    'rubric' => $question['explanation'],
                    'sample_answer' => $question['correct_answer'],
                    'position' => $index + 1,
                ]);
            }
        }
    }

    /** @return array<string, mixed> */
    private function pickVideoByTopic(string $topic, int $fallbackOffset): array
    {
        $matched = array_values(array_filter($this->videoLibrary, fn (array $video): bool => $video['topic'] === $topic));
        if ($matched !== []) {
            return $matched[$fallbackOffset % count($matched)];
        }

        return $this->videoLibrary[$fallbackOffset % count($this->videoLibrary)];
    }

    /** @return array<int, array<string, mixed>> */
    private function mcqQuestions(): array
    {
        return [
            [
                'question_text' => 'Which HTTP method is most appropriate for creating a new resource?',
                'options' => ['GET', 'POST', 'PUT', 'DELETE'],
                'correct_answer' => 'POST',
                'explanation' => 'POST is typically used to create new resources on the server.',
            ],
            [
                'question_text' => 'What is the primary purpose of a database index?',
                'options' => ['Encrypt rows', 'Speed up query lookups', 'Duplicate tables', 'Store backups'],
                'correct_answer' => 'Speed up query lookups',
                'explanation' => 'Indexes improve retrieval speed for frequently filtered columns.',
            ],
            [
                'question_text' => 'In Laravel, where are API routes commonly defined?',
                'options' => ['routes/api.php', 'routes/web.php', 'app/Providers', 'config/app.php'],
                'correct_answer' => 'routes/api.php',
                'explanation' => 'Laravel keeps stateless API endpoints in routes/api.php by convention.',
            ],
            [
                'question_text' => 'Which React concept helps reuse UI logic across components?',
                'options' => ['Hooks', 'Global CSS only', 'Inline SQL', 'Composer packages'],
                'correct_answer' => 'Hooks',
                'explanation' => 'Hooks encapsulate reusable stateful logic for function components.',
            ],
            [
                'question_text' => 'What does JWT mainly carry in an auth flow?',
                'options' => ['Compiled CSS', 'Identity claims', 'Video metadata', 'Database migrations'],
                'correct_answer' => 'Identity claims',
                'explanation' => 'JWT stores signed claims about user identity and token expiry.',
            ],
            [
                'question_text' => 'Which testing layer validates complete user workflows?',
                'options' => ['Unit test only', 'End-to-end test', 'Lint only', 'Static image test'],
                'correct_answer' => 'End-to-end test',
                'explanation' => 'End-to-end tests verify integrated behavior across system boundaries.',
            ],
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function trueFalseQuestions(): array
    {
        return [
            [
                'question_text' => 'A REST API should return predictable status codes for clients to handle responses safely.',
                'options' => ['True', 'False'],
                'correct_answer' => 'True',
                'explanation' => 'Consistent HTTP status codes are key for robust client-side error handling.',
            ],
            [
                'question_text' => 'Embedding credentials directly in frontend code is a secure practice.',
                'options' => ['True', 'False'],
                'correct_answer' => 'False',
                'explanation' => 'Secrets should stay in backend environment variables, never client bundles.',
            ],
            [
                'question_text' => 'Database normalization helps reduce redundant data and anomalies.',
                'options' => ['True', 'False'],
                'correct_answer' => 'True',
                'explanation' => 'Normalization organizes data to minimize duplication and inconsistency risk.',
            ],
            [
                'question_text' => 'Unit tests are useless when end-to-end tests exist.',
                'options' => ['True', 'False'],
                'correct_answer' => 'False',
                'explanation' => 'Unit tests provide fast feedback and isolate logic-level regressions.',
            ],
            [
                'question_text' => 'Rate limiting can help protect public APIs from abuse.',
                'options' => ['True', 'False'],
                'correct_answer' => 'True',
                'explanation' => 'Rate limiting controls excessive request bursts and improves API resilience.',
            ],
            [
                'question_text' => 'CI/CD pipelines should be skipped for production deployments.',
                'options' => ['True', 'False'],
                'correct_answer' => 'False',
                'explanation' => 'CI/CD enforces reliable build-test-release workflows for production quality.',
            ],
        ];
    }
}
