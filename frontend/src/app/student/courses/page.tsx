"use client";

import { useState } from "react";
import { BookOpen, CheckCircle, Play, FileText, Video } from "lucide-react";
import { DashboardLayout, PageHeader, ProgressBar, EmptyState } from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";
import { percentageForStudent } from "@/lib/utils/lms-helpers";
import { YouTubePlayer, extractYouTubeId } from "@/components/shared/youtube-player";
import Link from "next/link";

export default function StudentCoursesPage() {
  const { state, currentUser, markLessonComplete } = useMockLms();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  const studentName = currentUser?.name ?? state.users.find((u) => u.role === "student")?.name ?? "Student";

  const myEnrollments = state.enrollments.filter((e) =>
    e.studentId === currentUser?.id || e.studentName === studentName
  );
  const enrolledCourses = state.courses.filter((c) => myEnrollments.some((e) => e.courseId === c.id));
  const activeCourse = enrolledCourses.find((c) => c.id === selectedCourse) ?? enrolledCourses[0];

  async function handleComplete(courseId: string, lessonId: string) {
    setCompleting(lessonId);
    try {
      await markLessonComplete(courseId, lessonId, studentName);
      setAlert({ type: "success", msg: "Lesson marked as complete!" });
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to mark complete." });
    } finally {
      setCompleting(null);
    }
  }

  function getLessonIcon(type: string, hasVideo: boolean) {
    if (hasVideo) return <Video className="w-3.5 h-3.5" />;
    if (type === "video") return <Play className="w-3.5 h-3.5" />;
    if (type === "quiz") return <CheckCircle className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  }

  function getVideoThumbnail(url: string): string | null {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  }

  return (
    <DashboardLayout role="student">
      <PageHeader
        title="My Courses"
        subtitle="Continue learning where you left off."
      />

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
          <span>{alert.msg}</span>
          <button type="button" onClick={() => setAlert(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {enrolledCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No enrolled courses"
          description="Browse the catalog and enroll in a course to get started."
          action={<Link href="/catalog" className="btn-accent">Browse Catalog</Link>}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar: course list */}
          <div className="grid gap-3 content-start">
            {enrolledCourses.map((course) => {
              const pct = percentageForStudent(course, studentName);
              const isActive = course.id === (activeCourse?.id);
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5 ${isActive ? "border-primary/40 bg-primary/5 shadow-sm" : "border-border bg-card hover:shadow-sm"}`}
                >
                  <p className="font-semibold text-sm text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{course.category}</p>
                  <div className="mt-3">
                    <ProgressBar value={pct} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{pct}% complete</p>
                </button>
              );
            })}
          </div>

          {/* Main: active course detail */}
          {activeCourse && (
            <div className="card">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">{activeCourse.category}</p>
                  <h2 className="font-serif text-2xl text-foreground mt-1">{activeCourse.title}</h2>
                  {activeCourse.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{activeCourse.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-serif text-3xl font-semibold text-primary">{percentageForStudent(activeCourse, studentName)}%</p>
                  <p className="text-xs text-muted-foreground">complete</p>
                </div>
              </div>

              <div className="mb-6">
                <ProgressBar value={percentageForStudent(activeCourse, studentName)} label="Overall Progress" />
              </div>

              {/* Modules */}
              <div className="grid gap-4">
                {activeCourse.modules.map((mod) => (
                  <div key={mod.id}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <p className="text-sm font-semibold text-foreground">{mod.title}</p>
                      <span className="text-xs text-muted-foreground">({mod.lessons.length} lessons)</span>
                    </div>
                    <div className="grid gap-2">
                      {mod.lessons.map((lesson) => {
                        const completed = lesson.completedBy.includes(studentName);
                        const hasVideo = !!lesson.contentUrl && extractYouTubeId(lesson.contentUrl) !== null;
                        const thumbnail = lesson.contentUrl ? getVideoThumbnail(lesson.contentUrl) : null;

                        return (
                          <div key={lesson.id} className={`rounded-xl border transition-all ${completed ? "border-success/30 bg-success/5" : "border-border bg-card/50 hover:border-primary/30"}`}>
                            <div className="flex items-center gap-3 p-3">
                              {/* Thumbnail or Icon */}
                              {hasVideo && thumbnail ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveVideo({ url: lesson.contentUrl!, title: lesson.title })}
                                  className="group relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border border-border/50"
                                >
                                  <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
                                      <Play className="w-3 h-3 text-white fill-white ml-px" />
                                    </div>
                                  </div>
                                </button>
                              ) : (
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${completed ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                                  {completed ? <CheckCircle className="w-4 h-4" /> : getLessonIcon(lesson.type, hasVideo)}
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (hasVideo) setActiveVideo({ url: lesson.contentUrl!, title: lesson.title });
                                  }}
                                  className={`text-sm font-medium truncate block w-full text-left ${hasVideo ? "hover:text-primary cursor-pointer" : ""} ${completed ? "text-success" : "text-foreground"}`}
                                >
                                  {lesson.title}
                                </button>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {lesson.type} · {lesson.durationMinutes} min
                                  {hasVideo && <span className="ml-1.5 text-red-500 font-medium">▶ Video</span>}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                {hasVideo && (
                                  <button
                                    type="button"
                                    onClick={() => setActiveVideo({ url: lesson.contentUrl!, title: lesson.title })}
                                    className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                                  >
                                    <Play className="w-3 h-3" />
                                    Watch
                                  </button>
                                )}
                                {!completed && (
                                  <button
                                    type="button"
                                    disabled={completing === lesson.id}
                                    onClick={() => handleComplete(activeCourse.id, lesson.id)}
                                    className="btn-primary text-xs py-1.5 px-3 shrink-0"
                                  >
                                    {completing === lesson.id ? "…" : "Mark Done"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {mod.lessons.length === 0 && (
                        <p className="text-xs text-muted-foreground italic p-2">No lessons in this module yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* YouTube Video Player Modal */}
      {activeVideo && (
        <YouTubePlayer
          videoUrl={activeVideo.url}
          title={activeVideo.title}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </DashboardLayout>
  );
}
