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
$teacherBootstrap = Api Get '/api/v1/bootstrap' $teacher.token
$studentBootstrap = Api Get '/api/v1/bootstrap' $student.token
$result = [ordered]@{
  admin_login = [bool]$admin.token
  teacher_login = [bool]$teacher.token
  student_login = [bool]$student.token
  teacher_visible_users = ($teacherBootstrap.data.users | Measure-Object).Count
  teacher_visible_courses = ($teacherBootstrap.data.courses | Measure-Object).Count
  student_visible_users = ($studentBootstrap.data.users | Measure-Object).Count
  student_visible_courses = ($studentBootstrap.data.courses | Measure-Object).Count
  student_visible_invoices = ($studentBootstrap.data.invoices | Measure-Object).Count
  student_visible_audit = ($studentBootstrap.data.auditEvents | Measure-Object).Count
}
$result | ConvertTo-Json -Depth 6 | Set-Content '.role-check.json'
