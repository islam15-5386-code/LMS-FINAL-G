<?php

namespace App\Providers;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\LiveClass;
use App\Models\Payment;
use App\Models\User;
use App\Policies\CertificatePolicy;
use App\Policies\ClassSchedulePolicy;
use App\Policies\CoursePolicy;
use App\Policies\PaymentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Course::class, CoursePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
        Gate::policy(Certificate::class, CertificatePolicy::class);
        Gate::policy(LiveClass::class, ClassSchedulePolicy::class);
        Gate::define('manage-reports', [\App\Policies\ReportPolicy::class, 'manage']);
    }
}
