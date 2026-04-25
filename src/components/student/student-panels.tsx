"use client";

import type { CourseModule } from "@/lib/mock-lms";
import { Award, BookOpen, CalendarClock, FileText } from "lucide-react";
import { useState } from "react";

import { useMockLms } from "@/providers/mock-lms-provider";

import {
  Badge,
  buildCertificateHtml,
  downloadHtmlFile,
  MetricGrid,
  PrimaryButton,
  SecondaryButton,
  Section,
  SelectInput,
  TextArea,
  TextInput,
  percentageForStudent
} from "@/components/shared/lms-core";

export function StudentAssessmentPanel() {
  const { state, currentUser, submitAssessment } = useMockLms();
  const [assessmentId, setAssessmentId] = useState(state.assessments[0]?.id ?? "");
  const [answerText, setAnswerText] = useState("This answer references compliance, audit, and policy design to satisfy the rubric.");
  const studentName = currentUser?.name ?? "Student";
  const mySubmissions = state.submissions.filter((submission) => submission.studentName === studentName);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Section title="Take assessment" subtitle="Students can submit quiz or essay responses and receive immediate scoring and feedback in the demo.">
        <div className="grid gap-3">
          <SelectInput value={assessmentId} onChange={(event) => setAssessmentId(event.target.value)}>
            {state.assessments.filter((assessment) => assessment.status === "published").map((assessment) => (
              <option key={assessment.id} value={assessment.id}>
                {assessment.title}
              </option>
            ))}
          </SelectInput>
          <TextArea value={answerText} onChange={(event) => setAnswerText(event.target.value)} placeholder="Write your answer here" />
          <PrimaryButton onClick={() => submitAssessment(assessmentId, studentName, answerText)}>Submit assessment</PrimaryButton>
        </div>
      </Section>

      <Section title="Submission history" subtitle="Scores, pass/fail outcomes, and written feedback are preserved in the mock student record.">
        <div className="grid gap-4">
          {mySubmissions.map((submission) => {
            const assessment = state.assessments.find((item) => item.id === submission.assessmentId);
            return (
              <div key={submission.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{assessment?.title ?? "Assessment"}</p>
                  <Badge>{submission.score}%</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{submission.feedback}</p>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

export function StudentCoursesPanel({ selectedCourseId }: { selectedCourseId?: string }) {
  const { state, currentUser, markLessonComplete } = useMockLms();
  const studentName = currentUser?.name ?? "Student";
  const selectedCourse = state.courses.find((course) => course.id === selectedCourseId) ?? state.courses[0];
  const selectedCourseCertificate = state.certificates.find(
    (certificate) => certificate.courseId === selectedCourse?.id && certificate.studentName === studentName && !certificate.revoked
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Section title="My courses" subtitle="Progress, drip content, and next-step clarity are all visible from the learner side.">
        <div className="grid gap-4">
          {state.courses.filter((course) => course.status === "published").map((course) => (
            <div key={course.id} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-[2px] hover:shadow-glow dark:border-white/8 dark:bg-[#13212a]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.category}</p>
                </div>
                <Badge>{percentageForStudent(course, studentName)}%</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{course.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {selectedCourse ? (
        <Section title={selectedCourse.title} subtitle="Mark lessons complete and issue a certificate when the course is done.">
          <div className="grid gap-4">
            {selectedCourse.modules.map((module: CourseModule) => (
              <div key={module.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 shadow-soft dark:border-white/8 dark:bg-[#13212a]">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{module.title}</p>
                  <Badge>Drip +{module.dripDays}d</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {module.lessons.map((lesson) => {
                    const completed = lesson.completedBy.includes(studentName);
                    return (
                      <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">{lesson.type} · {lesson.durationMinutes} min</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge>{completed ? "completed" : "pending"}</Badge>
                          {!completed ? (
                            <SecondaryButton onClick={() => markLessonComplete(selectedCourse.id, lesson.id, studentName)}>
                              Mark complete
                            </SecondaryButton>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {selectedCourseCertificate ? (
              <PrimaryButton
                onClick={() =>
                  downloadHtmlFile(
                    `${studentName.replace(/\s+/g, "-").toLowerCase()}-${selectedCourse.id}-certificate.html`,
                    buildCertificateHtml({
                      certificate: selectedCourseCertificate,
                      branding: state.branding
                    })
                  )
                }
              >
                Download earned certificate
              </PrimaryButton>
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-foreground/15 bg-background/60 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
                Finish every lesson in this course and your certificate will be issued automatically.
              </div>
            )}
          </div>
        </Section>
      ) : null}
    </div>
  );
}

export function StudentSettingsPanel() {
  const { currentUser } = useMockLms();

  return (
    <Section title="Student profile and settings" subtitle="Manage learner identity, preferences, and convenience settings from the frontend.">
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput defaultValue={currentUser?.name ?? "Student"} />
        <TextInput defaultValue={currentUser?.email ?? "student@example.com"} />
        <TextInput defaultValue={currentUser?.department ?? "Learner"} />
        <SelectInput defaultValue="Daily">
          <option>Daily</option>
          <option>Only important reminders</option>
          <option>Weekly summary</option>
        </SelectInput>
      </div>
    </Section>
  );
}

export function StudentLiveClassesPanel() {
  const { state } = useMockLms();

  return (
    <Section title="My live classes" subtitle="View upcoming sessions, schedule details, and session status without teacher scheduling controls.">
      <div className="grid gap-4">
        {state.liveClasses.map((liveClass) => (
          <div key={liveClass.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-5 shadow-soft dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">{liveClass.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(liveClass.startAt).toLocaleString()} · {liveClass.durationMinutes} min · {liveClass.provider}
                </p>
              </div>
              <Badge>{liveClass.status}</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Participant limit</p>
                <p className="mt-2 font-semibold">{liveClass.participantLimit}</p>
              </div>
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">24h reminder</p>
                <p className="mt-2 font-semibold">{liveClass.reminder24h ? "Enabled" : "Off"}</p>
              </div>
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">1h reminder</p>
                <p className="mt-2 font-semibold">{liveClass.reminder1h ? "Enabled" : "Off"}</p>
              </div>
            </div>
            {liveClass.meetingUrl ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton onClick={() => window.open(liveClass.meetingUrl, "_blank", "noopener,noreferrer")}>
                  {liveClass.status === "live" ? "Join live class" : "Open live room"}
                </PrimaryButton>
                {liveClass.recordingUrl ? (
                  <SecondaryButton onClick={() => window.open(liveClass.recordingUrl, "_blank", "noopener,noreferrer")}>
                    Watch recording
                  </SecondaryButton>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function StudentCertificatesPanel() {
  const { state, currentUser } = useMockLms();
  const studentName = currentUser?.name ?? "Student";
  const myCertificates = state.certificates.filter((certificate) => certificate.studentName === studentName);

  return (
    <Section title="My certificates" subtitle="Only the signed-in learner can view their earned certificates and verification codes here.">
      <div className="grid gap-4">
        {myCertificates.map((certificate) => (
          <div key={certificate.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-5 shadow-soft dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">{certificate.courseTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</p>
              </div>
              <Badge>{certificate.revoked ? "revoked" : "active"}</Badge>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-4 text-sm text-muted-foreground dark:border-white/8 dark:bg-white/5">
                <div>
                  Certificate no:{" "}
                  <span className="font-semibold text-foreground">{certificate.certificateNumber ?? "Pending sync"}</span>
                </div>
                <div className="mt-2">
                  Verification code: <span className="font-semibold text-foreground">{certificate.verificationCode}</span>
                </div>
              </div>
              <PrimaryButton
                onClick={() =>
                  downloadHtmlFile(
                    `${studentName.replace(/\s+/g, "-").toLowerCase()}-${certificate.courseId}-certificate.html`,
                    buildCertificateHtml({
                      certificate,
                      branding: state.branding
                    })
                  )
                }
                className="w-full min-w-[220px] md:w-auto"
              >
                Download certificate
              </PrimaryButton>
            </div>
          </div>
        ))}
        {!myCertificates.length ? (
          <div className="rounded-[1.4rem] border border-dashed border-foreground/15 bg-background/60 p-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
            No certificates have been issued to this learner yet.
          </div>
        ) : null}
      </div>
    </Section>
  );
}

export function StudentDashboardPanel() {
  const { state, currentUser } = useMockLms();
  const studentName = currentUser?.name ?? "Student";

  return (
    <div className="grid gap-6">
      <MetricGrid
        items={[
          { label: "Active courses", value: String(state.courses.filter((course) => course.status === "published").length), icon: <BookOpen className="h-5 w-5" /> },
          { label: "Assessments taken", value: String(state.submissions.filter((submission) => submission.studentName === studentName).length), icon: <FileText className="h-5 w-5" /> },
          { label: "Upcoming live classes", value: String(state.liveClasses.filter((item) => item.status === "scheduled").length), icon: <CalendarClock className="h-5 w-5" /> },
          { label: "Certificates", value: String(state.certificates.filter((certificate) => certificate.studentName === studentName).length), icon: <Award className="h-5 w-5" /> }
        ]}
      />
      <StudentCoursesPanel />
    </div>
  );
}
