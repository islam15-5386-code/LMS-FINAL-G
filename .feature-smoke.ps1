$ErrorActionPreference = 'Stop'
function Login($email) {
  $body = @{ email = $email; password = 'password' } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8000/api/v1/auth/login' -ContentType 'application/json' -Body $body
}
function Api($method, $path, $token, $body = $null) {
  $headers = @{ Authorization = "Bearer $token"; Accept = 'application/json' }
  if ($null -ne $body) {
    Invoke-RestMethod -Method $method -Uri ("http://127.0.0.1:8000" + $path) -Headers $headers -ContentType 'application/json' -Body ($body | ConvertTo-Json -Depth 8)
  } else {
    Invoke-RestMethod -Method $method -Uri ("http://127.0.0.1:8000" + $path) -Headers $headers
  }
}
$admin = Login 'abdur.ahsan1@dhaka-dsi.example.com'
$teacher = Login 'afsana.ahsan3@dhaka-dsi.example.com'
$student = Login 'amena.ahsan7@dhaka-dsi.example.com'
$course = Api Post '/api/v1/courses' $teacher.token @{ title = 'Backend Smoke Test Course 3'; category = 'Engineering'; description = 'Teacher-created course for full-stack smoke testing.'; price = 1800 }
$courseId = [string]$course.data.id
$module = Api Post "/api/v1/courses/$courseId/modules" $teacher.token @{ title = 'Smoke Test Module'; drip_days = 0 }
$moduleId = [string]$module.data.id
$lesson = Api Post "/api/v1/courses/$courseId/modules/$moduleId/lessons" $teacher.token @{ title = 'Smoke Test Lesson'; type = 'document'; duration_minutes = 14 }
$lessonId = [string]$lesson.data.id
$null = Api Post "/api/v1/courses/$courseId/publish" $teacher.token
$assessment = Api Post '/api/v1/teacher/assessments/generate' $teacher.token @{ course_id = [int]$courseId; title = 'Smoke Test Assessment'; type = 'MCQ'; question_count = 4; source_text = 'routing controllers middleware validation requests authentication authorization postgresql reporting analytics' }
$assessmentId = [string]$assessment.data.id
$null = Api Post "/api/v1/assessments/$assessmentId/publish" $teacher.token
$live = Api Post '/api/v1/live-classes' $teacher.token @{ course_id = [int]$courseId; title = 'Smoke Test Live Session'; start_at = [DateTime]::UtcNow.AddDays(1).ToString('o'); duration_minutes = 45 }
$liveId = [string]$live.data.id
$null = Api Patch "/api/v1/live-classes/$liveId/status" $teacher.token @{ status = 'live' }
$lessonDone = Api Post "/api/v1/courses/$courseId/lessons/$lessonId/complete" $student.token
$submission = Api Post "/api/v1/assessments/$assessmentId/submit" $student.token @{ answer_text = 'controllers and validation help secure application routing flows' }
$certificate = Api Post '/api/v1/certificates' $admin.token @{ user_id = 8; course_id = [int]$courseId }
$billing = Api Patch '/api/v1/billing' $admin.token @{ plan = 'Growth'; active_students = 430 }
$reminders = Api Post '/api/v1/reports/compliance/reminders' $admin.token @{}
$result = [ordered]@{
  course_id = $courseId
  module_id = $moduleId
  lesson_id = $lessonId
  assessment_id = $assessmentId
  live_class_id = $liveId
  lesson_completed = [string]$lessonDone.message
  submission_status = [string]$submission.message
  certificate_status = [string]$certificate.message
  billing_plan = [string]$billing.data.plan
  reminder_status = [string]$reminders.message
}
$result | ConvertTo-Json -Depth 6 | Set-Content '.feature-smoke.json'
