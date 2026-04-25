<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\Support\BangladeshLmsDataset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = array_values(BangladeshLmsDataset::courseCatalog());

        Tenant::query()->orderBy('id')->each(function (Tenant $tenant) use ($catalog): void {
            $teachers = User::query()
                ->where('tenant_id', $tenant->id)
                ->where('role', 'teacher')
                ->orderBy('id')
                ->get()
                ->values();

            for ($courseIndex = 0; $courseIndex < 8; $courseIndex++) {
                $template = $catalog[($tenant->id + $courseIndex - 1) % count($catalog)];
                $teacher = $teachers[$courseIndex % max(1, $teachers->count())];
                $slug = Str::slug($tenant->subdomain . '-' . $template['title']);
                $status = (($courseIndex + $tenant->id) % 5 === 0) ? 'draft' : 'published';

                $course = Course::query()->updateOrCreate(
                    ['slug' => $slug],
                    [
                        'tenant_id' => $tenant->id,
                        'teacher_id' => $teacher->id,
                        'title' => $template['title'],
                        'category' => $template['category'],
                        'description' => $template['description'],
                        'price_bdt' => $template['price_bdt'],
                        'price' => $template['price_bdt'],
                        'level' => $template['level'],
                        'status' => $status,
                        'published_at' => $status === 'published'
                            ? Carbon::now()->subDays(($tenant->id * 3) + $courseIndex)
                            : null,
                        'thumbnail_url' => BangladeshLmsDataset::thumbnailUrl($tenant->subdomain, $slug),
                        'enrollment_count' => 0,
                    ]
                );

                $this->seedModulesAndLessons($course, $template, $tenant->id, $courseIndex);
            }
        });
    }

    private function seedModulesAndLessons(Course $course, array $template, int $tenantIndex, int $courseIndex): void
    {
        $moduleTitles = $template['modules'];

        if ((($tenantIndex + $courseIndex) % 2) === 0) {
            $moduleTitles[] = 'Project Clinic and Review';
        }

        $lessonPool = $template['lessons'];

        if ((($tenantIndex + $courseIndex) % 3) === 0) {
            $lessonPool[] = ['title' => 'Capstone review and feedback', 'type' => 'assignment'];
        }

        $lessonsPerModule = (int) ceil(count($lessonPool) / count($moduleTitles));
        $position = 1;

        foreach ($moduleTitles as $moduleIndex => $moduleTitle) {
            $module = CourseModule::query()->updateOrCreate(
                [
                    'course_id' => $course->id,
                    'position' => $moduleIndex + 1,
                ],
                [
                    'title' => $moduleTitle,
                    'drip_days' => $moduleIndex * 3,
                ]
            );

            $lessonSlice = array_slice($lessonPool, $moduleIndex * $lessonsPerModule, $lessonsPerModule);

            foreach ($lessonSlice as $lessonIndex => $lessonData) {
                Lesson::query()->updateOrCreate(
                    [
                        'course_module_id' => $module->id,
                        'position' => $lessonIndex + 1,
                    ],
                    [
                        'title' => $lessonData['title'],
                        'type' => $lessonData['type'],
                        'duration_minutes' => 18 + (($tenantIndex + $courseIndex + $position) % 25),
                        'release_at' => Carbon::now()->subDays(($tenantIndex + $courseIndex) % 10)->addDays($moduleIndex + $lessonIndex),
                    ]
                );

                $position++;
            }
        }
    }
}
