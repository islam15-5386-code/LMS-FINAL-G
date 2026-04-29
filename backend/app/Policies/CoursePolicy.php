<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Course $course): bool
    {
        return $user->role === 'admin' && (int) $user->tenant_id === (int) $course->tenant_id;
    }

    public function delete(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    public function assignTeacher(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    public function removeStudent(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }
}

