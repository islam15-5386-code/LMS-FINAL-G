<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DiuStudentSeeder extends Seeder
{
    public function run(): void
    {
        $emails = [
            'cpc@diu.edu.bd',
            'islam15-5201@diu.edu.bd',
            'islam15-5676@diu.edu.bd',
            'islam15-5865@diu.edu.bd',
            'ahamed15-5553@diu.edu.bd',
            'shakil15-5579@diu.edu.bd',
            'sahabi15-4842@diu.edu.bd',
            'mondal15-5329@diu.edu.bd',
            'hamim15-5264@diu.edu.bd',
            'anik15-4922@diu.edu.bd',
            'hossain15-6039@diu.edu.bd',
            'akter15-5245@diu.edu.bd',
            'arefin15-5279@diu.edu.bd',
            'tanzim15-5400@diu.edu.bd',
            'md15-5618@diu.edu.bd',
            'ahmad15-4699@diu.edu.bd',
            'jahan15-4690@diu.edu.bd',
            'siyam15-4909@diu.edu.bd',
            'billah15-5571@diu.edu.bd',
            'kamal15-5723@diu.edu.bd',
            'shihab15-4905@diu.edu.bd',
            'nayeem15-5049@diu.edu.bd',
            'khandaker15-5383@diu.edu.bd',
            'shafiqul15-4656@diu.edu.bd',
            'shakibur15-4714@diu.edu.bd',
            'priya15-4765@diu.edu.bd',
            'riti15-5371@diu.edu.bd',
            'akther15-5671@diu.edu.bd',
            'hossain15-4724@diu.edu.bd',
            'singha15-5290@diu.edu.bd',
            'sajib15-5543@diu.edu.bd',
            'ashraf15-5881@diu.edu.bd',
            'hossain15-4949@diu.edu.bd',
            'garodia15-5048@diu.edu.bd',
            'rabbi15-4945@diu.edu.bd',
            'howlader15-6029@diu.edu.bd',
            'nafis15-5798@diu.edu.bd',
            'jim15-5364@diu.edu.bd',
            'mahfujur15-4691@diu.edu.bd',
            'abdullah15-5240@diu.edu.bd',
            'tasin15-5635@diu.edu.bd',
            'islam15-5306@diu.edu.bd',
            'nowshin15-4632@diu.edu.bd',
            'shohan15-5925@diu.edu.bd',
            'islam15-5861@diu.edu.bd',
            'sarker15-5879@diu.edu.bd',
            'rumi15-5468@diu.edu.bd',
            'hasan15-5022@diu.edu.bd',
            'shovo15-5983@diu.edu.bd',
            'ahmed15-5729@diu.edu.bd',
            'huqe15-5830@diu.edu.bd',
            'amin15-5577@diu.edu.bd',
            'shovon15-5560@diu.edu.bd',
            'asik15-4976@diu.edu.bd',
            'amin15-4779@diu.edu.bd',
            'sadib15-4863@diu.edu.bd',
            'mehedi15-4680@diu.edu.bd',
            'kumar15-4650@diu.edu.bd',
            'ripa15-5921@diu.edu.bd',
            'rahman15-5137@diu.edu.bd',
            'man15-4671@diu.edu.bd',
            'nila15-4824@diu.edu.bd',
            'sarker15-5274@diu.edu.bd',
            'rashid15-5273@diu.edu.bd',
            'paul15-4868@diu.edu.bd',
            'tabib15-5707@diu.edu.bd',
            'jahan15-5665@diu.edu.bd',
            'mahi15-5762@diu.edu.bd',
            'tanvir15-4934@diu.edu.bd',
            'sohag15-5486@diu.edu.bd',
            'faisal15-4721@diu.edu.bd',
            'faruk15-4920@diu.edu.bd',
        ];

        $tenant = Tenant::first();
        if (!$tenant) return;

        $courses = Course::where('tenant_id', $tenant->id)->get();

        foreach ($emails as $email) {
            $prefix = explode('@', $email)[0];
            
            // Generate a readable name from prefix
            // e.g. islam15-5201 -> Islam (5201)
            if (preg_match('/([a-z]+)[0-9\-]+([0-9]{4})/', $prefix, $matches)) {
                $namePart = ucfirst($matches[1]);
                $idPart = $matches[2];
                $name = "Md. {$namePart} ({$idPart})";
            } elseif ($prefix === 'cpc') {
                $name = "DIU CPC Admin";
            } else {
                $name = ucfirst($prefix);
            }

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'tenant_id' => $tenant->id,
                    'name' => $name,
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'email_verified_at' => now(),
                    'phone' => '01' . rand(3, 9) . rand(10000000, 99999999),
                    'department' => 'Computer Science and Engineering',
                    'city' => 'Dhaka',
                    'address' => 'Dhanmondi, Dhaka',
                    'is_active' => true,
                ]
            );

            // Enroll them in 1-3 random courses if courses exist
            if ($courses->isNotEmpty()) {
                $randomCourses = $courses->random(rand(1, 3));
                foreach ($randomCourses as $course) {
                    Enrollment::updateOrCreate(
                        [
                            'student_id' => $user->id,
                            'course_id' => $course->id,
                        ],
                        [
                            'tenant_id' => $tenant->id,
                            'status' => 'active',
                            'progress_percentage' => rand(0, 40),
                            'enrolled_at' => now()->subDays(rand(1, 30)),
                        ]
                    );
                }
            }
        }
    }
}
