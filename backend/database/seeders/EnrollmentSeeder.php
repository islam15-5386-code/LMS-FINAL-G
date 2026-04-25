<?php

namespace Database\Seeders;

use App\Models\ComplianceRecord;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::query()->orderBy('id')->each(function (Tenant $tenant): void {
            $students = User::query()
                ->where('tenant_id', $tenant->id)
                ->where('role', 'student')
                ->orderBy('id')
                ->get()
                ->values();

            Course::query()
                ->where('tenant_id', $tenant->id)
                ->with('modules.lessons')
                ->orderBy('id')
                ->get()
                ->values()
                ->each(function (Course $course, int $courseIndex) use ($tenant, $students): void {
                    $enrollmentCount = min($students->count(), 12 + (($courseIndex + $tenant->id) % 8));
                    $offset = ($courseIndex * 3) % max(1, $students->count());
                    $selectedStudents = $students->slice($offset)->concat($students->take($offset))->take($enrollmentCount)->values();
                    $courseLessons = $course->modules->flatMap->lessons->values();

                    foreach ($selectedStudents as $studentIndex => $student) {
                        $status = match (($studentIndex + $courseIndex) % 6) {
                            0 => 'completed',
                            1, 2, 3 => 'active',
                            4 => 'pending',
                            default => 'cancelled',
                        };

                        $progress = match ($status) {
                            'completed' => 100,
                            'active' => 55 + (($studentIndex * 7) % 40),
                            'pending' => 10 + (($studentIndex * 5) % 20),
                            default => 0,
                        };

                        $enrolledAt = Carbon::now()->subDays(40 + (($courseIndex + $studentIndex) % 90));
                        $completedAt = $status === 'completed'
                            ? (clone $enrolledAt)->addDays(20 + ($studentIndex % 15))
                            : null;

                        Enrollment::query()->updateOrCreate(
                            [
                                'course_id' => $course->id,
                                'student_id' => $student->id,
                            ],
                            [
                                'tenant_id' => $tenant->id,
                                'status' => $status,
                                'progress_percentage' => $progress,
                                'enrolled_at' => $enrolledAt,
                                'completed_at' => $completedAt,
                            ]
                        );

                        $this->syncLessonCompletion($courseLessons, $student, $progress, $enrolledAt);

                        ComplianceRecord::query()->updateOrCreate(
                            [
                                'tenant_id' => $tenant->id,
                                'user_id' => $student->id,
                                'course_id' => $course->id,
                            ],
                            [
                                'employee_name' => $student->name,
                                'department' => $student->department ?? 'Operations',
                                'role_title' => $student->department ? $student->department . ' Executive' : 'Learner',
                                'course_title' => $course->title,
                                'completion_percent' => $progress,
                                'certified' => $status === 'completed',
                            ]
                        );
                    }

                    $course->update([
                        'enrollment_count' => Enrollment::query()
                            ->where('course_id', $course->id)
                            ->whereIn('status', ['active', 'completed', 'pending'])
                            ->count(),
                    ]);
                });
        });
    }

    private function syncLessonCompletion($lessons, User $student, int $progress, Carbon $enrolledAt): void
    {
        $lessonCount = $lessons->count();

        if ($lessonCount === 0 || $progress === 0) {
            return;
        }

        $completedLessons = (int) floor(($progress / 100) * $lessonCount);

        $lessons->take($completedLessons)->each(function (Lesson $lesson, int $index) use ($student, $enrolledAt): void {
            $lesson->completedUsers()->syncWithoutDetaching([
                $student->id => [
                    'completed_at' => (clone $enrolledAt)->addDays($index + 1),
                ],
            ]);
        });
    }
}
