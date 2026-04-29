<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PopulateStudentCourseModules extends Command
{
    protected $signature = 'lms:populate-student-courses {email=student@example.com} {--courses=4} {--modules=10}';

    protected $description = 'Populate first N enrolled student courses with N modules and YouTube lessons.';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $courseLimit = max(1, (int) $this->option('courses'));
        $moduleLimit = max(1, (int) $this->option('modules'));

        /** @var User|null $student */
        $student = User::query()->where('email', $email)->first();
        if (! $student) {
            $this->error("Student not found for email: {$email}");
            return self::FAILURE;
        }

        $courseIds = Enrollment::query()
            ->where('tenant_id', $student->tenant_id)
            ->where('student_id', $student->id)
            ->where('status', '!=', 'removed')
            ->orderBy('id')
            ->pluck('course_id')
            ->unique()
            ->take($courseLimit)
            ->values();

        if ($courseIds->isEmpty()) {
            $this->warn('No enrolled courses found for this student.');
            return self::SUCCESS;
        }

        $courses = Course::query()
            ->whereIn('id', $courseIds)
            ->get()
            ->sortBy(function (Course $course) use ($courseIds): int {
                $index = $courseIds->search($course->id);
                return $index === false ? PHP_INT_MAX : (int) $index;
            })
            ->values();

        $youtubeByTrack = $this->youtubeTracks();

        DB::transaction(function () use ($courses, $moduleLimit, $youtubeByTrack): void {
            foreach ($courses as $courseIndex => $course) {
                $trackKey = array_keys($youtubeByTrack)[$courseIndex % count($youtubeByTrack)];
                $track = $youtubeByTrack[$trackKey];
                $moduleNames = $track['modules'];
                $videoUrls = $track['videos'];

                for ($m = 1; $m <= $moduleLimit; $m++) {
                    $moduleTitle = $moduleNames[($m - 1) % count($moduleNames)] . " (M{$m})";
                    $videoUrl = $videoUrls[($m - 1) % count($videoUrls)];

                    $module = CourseModule::query()->updateOrCreate(
                        [
                            'course_id' => $course->id,
                            'position' => $m,
                        ],
                        [
                            'tenant_id' => $course->tenant_id,
                            'title' => $moduleTitle,
                            'drip_days' => ($m - 1) * 2,
                        ]
                    );

                    Lesson::query()->updateOrCreate(
                        [
                            'course_module_id' => $module->id,
                            'position' => 1,
                        ],
                        [
                            'tenant_id' => $course->tenant_id,
                            'title' => "{$moduleTitle} - Free YouTube Class",
                            'type' => 'video',
                            'content_url' => $videoUrl,
                            'content_mime' => 'video/youtube',
                            'content_original_name' => "YouTube: {$moduleTitle}",
                            'duration_minutes' => 35 + (($m * 3) % 25),
                            'release_at' => Carbon::now()->subDays(2)->addDays($m),
                        ]
                    );
                }

                $this->info("Updated: {$course->title} -> {$moduleLimit} modules");
            }
        });

        $this->info('Done: modules and YouTube lessons added successfully.');
        return self::SUCCESS;
    }

    /**
     * Curated free YouTube learning tracks.
     *
     * @return array<string, array{modules: array<int, string>, videos: array<int, string>}>
     */
    private function youtubeTracks(): array
    {
        return [
            'fullstack' => [
                'modules' => [
                    'Web Foundations: HTML & Semantic Markup',
                    'Modern CSS Layouts and Responsive Design',
                    'JavaScript Core: Variables to DOM',
                    'ES6+ and Async JavaScript',
                    'TypeScript Essentials',
                    'React Component Patterns',
                    'Next.js Routing and Data Fetching',
                    'Node.js API Development',
                    'SQL and Database Modeling',
                    'Deployment and Production Checklist',
                ],
                'videos' => [
                    'https://www.youtube.com/watch?v=pQN-pnXPaVg',
                    'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
                    'https://www.youtube.com/watch?v=PkZNo7MFNFg',
                    'https://www.youtube.com/watch?v=PoRJizFvM7s',
                    'https://www.youtube.com/watch?v=30LWjhZzg50',
                    'https://www.youtube.com/watch?v=bMknfKXIFA8',
                    'https://www.youtube.com/watch?v=wm5gMKuwSYk',
                    'https://www.youtube.com/watch?v=Oe421EPjeBE',
                    'https://www.youtube.com/watch?v=HXV3zeQKqGY',
                    'https://www.youtube.com/watch?v=RGOj5yH7evk',
                ],
            ],
            'flutter' => [
                'modules' => [
                    'Flutter Setup and Project Structure',
                    'Dart Basics for Flutter',
                    'Widgets and Layout System',
                    'State Management Fundamentals',
                    'Navigation and Routing',
                    'Forms and Validation',
                    'REST API Integration',
                    'Firebase Basics for Flutter',
                    'Animations and UI Polish',
                    'Build and Release to Production',
                ],
                'videos' => [
                    'https://www.youtube.com/watch?v=VPvVD8t02U8',
                    'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
                    'https://www.youtube.com/watch?v=1xipg02Wu8s',
                    'https://www.youtube.com/watch?v=d_m5csmrf7I',
                    'https://www.youtube.com/watch?v=nyvwx7o277U',
                    'https://www.youtube.com/watch?v=CD1Y2DmL5JM',
                    'https://www.youtube.com/watch?v=ylJz7N-dv1E',
                    'https://www.youtube.com/watch?v=EXp0gq9kGxI',
                    'https://www.youtube.com/watch?v=ZYb_x7Qf5Y8',
                    'https://www.youtube.com/watch?v=fq4N0hgOWzU',
                ],
            ],
            'laravel' => [
                'modules' => [
                    'Laravel Installation and Environment',
                    'Routing, Controllers and Blade Basics',
                    'Migrations and Eloquent ORM',
                    'Form Requests and Validation',
                    'Authentication and Authorization',
                    'REST API with Resource Controllers',
                    'File Uploads and Storage',
                    'Queue, Jobs and Scheduling',
                    'Testing Laravel Applications',
                    'Deployment and Security Hardening',
                ],
                'videos' => [
                    'https://www.youtube.com/watch?v=MYyJ4PuL4pY',
                    'https://www.youtube.com/watch?v=ImtZ5yENzgE',
                    'https://www.youtube.com/watch?v=MFh0Fd7BsjE',
                    'https://www.youtube.com/watch?v=ltzlhAxJr74',
                    'https://www.youtube.com/watch?v=2-_M0h0X7do',
                    'https://www.youtube.com/watch?v=YGqCZjdgJJk',
                    'https://www.youtube.com/watch?v=QMT0QwzEmh0',
                    'https://www.youtube.com/watch?v=V_5lD2v4mQA',
                    'https://www.youtube.com/watch?v=0RJSbM7eSx8',
                    'https://www.youtube.com/watch?v=5sY9xAHhQkA',
                ],
            ],
            'excel-data' => [
                'modules' => [
                    'Excel Interface and Data Entry',
                    'Formulas and Functions Essentials',
                    'Lookup Functions and Data Cleaning',
                    'Sorting, Filtering and Conditional Logic',
                    'Charts and Visual Storytelling',
                    'Pivot Tables and Pivot Charts',
                    'Power Query Fundamentals',
                    'Dashboard Design in Excel',
                    'Business Case Analysis',
                    'Portfolio Project and Presentation',
                ],
                'videos' => [
                    'https://www.youtube.com/watch?v=pCJ15nGFgVg',
                    'https://www.youtube.com/watch?v=Vl0H-qTclOg',
                    'https://www.youtube.com/watch?v=4c0CLUER6nw',
                    'https://www.youtube.com/watch?v=DAU0qqh_I-A',
                    'https://www.youtube.com/watch?v=opJgMj1IUrc',
                    'https://www.youtube.com/watch?v=qu-AK0Hv0b4',
                    'https://www.youtube.com/watch?v=0aeZX1l4JT4',
                    'https://www.youtube.com/watch?v=K74_FNnlIF8',
                    'https://www.youtube.com/watch?v=Q8tx9WQJq9Y',
                    'https://www.youtube.com/watch?v=6QfwrVq6zK8',
                ],
            ],
        ];
    }
}
