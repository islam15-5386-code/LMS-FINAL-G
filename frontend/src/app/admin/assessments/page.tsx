"use client";

import { useState } from "react";
import { FileText, Plus, Eye, Edit, Trash2, CheckCircle, BarChart3, Zap, X } from "lucide-react";
import {
  DashboardLayout, PageHeader, EmptyState, SearchBar
} from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";

export default function AdminAssessmentsPage() {
  const { state, getAssessment, updateAssessment, deleteAssessment } = useMockLms();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "ai">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [editForm, setEditForm] = useState({ 
    title: "", 
    type: "", 
    passing_mark: 0,
    total_marks: 100
  });

  const totalAssessments = state.assessments.length;
  const publishedAssessments = state.assessments.filter((a) => a.status === "published").length;
  const aiGenerated = state.assessments.filter((a) => a.generatedFrom.toLowerCase().includes("ai")).length;
  const totalSubmissions = state.submissions.length;

  const filteredAssessments = state.assessments.filter((assessment) => {
    const matchFilter = 
      filter === "all" ? true :
      filter === "published" ? assessment.status === "published" :
      filter === "draft" ? assessment.status === "draft" :
      filter === "ai" ? assessment.generatedFrom.toLowerCase().includes("ai") : false;
    
    const matchSearch = 
      assessment.title.toLowerCase().includes(search.toLowerCase()) ||
      assessment.generatedFrom.toLowerCase().includes(search.toLowerCase());
    
    return matchFilter && matchSearch;
  });

  const getTypeColor = (type: string) => {
    if (type === "Quiz") return "from-blue-500 to-cyan-500";
    if (type === "Essay") return "from-purple-500 to-pink-500";
    if (type === "Short Answer") return "from-amber-500 to-orange-500";
    return "from-slate-500 to-gray-500";
  };

  const getTypeIcon = (type: string) => {
    if (type === "Quiz") return "📝";
    if (type === "Essay") return "✍️";
    if (type === "Short Answer") return "💬";
    return "📋";
  };

  const handleView = async (assessment: any) => {
    try {
      setIsLoading(true);
      await getAssessment(assessment.id);
      setSelectedAssessment(assessment);
      setAlert({ type: "success", msg: `Viewing "${assessment.title}"` });
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to load assessment details" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (assessment: any) => {
    setSelectedAssessment(assessment);
    setEditForm({
      title: assessment.title,
      type: assessment.type,
      passing_mark: assessment.passingMark || 50,
      total_marks: assessment.totalMarks || 100
    });
    setShowEdit(true);
  };

  const handleEditSubmit = async () => {
    try {
      setIsLoading(true);
      await updateAssessment(selectedAssessment.id, {
        title: editForm.title,
        type: editForm.type,
        passing_mark: editForm.passing_mark,
        total_marks: editForm.total_marks
      });
      setAlert({ type: "success", msg: `"${editForm.title}" updated successfully!` });
      setShowEdit(false);
      setSelectedAssessment(null);
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to update assessment" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (assessment: any) => {
    setSelectedAssessment(assessment);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await deleteAssessment(selectedAssessment.id);
      setAlert({ type: "success", msg: `"${selectedAssessment.title}" deleted successfully!` });
      setShowDelete(false);
      setSelectedAssessment(null);
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to delete assessment" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "published") return "from-green-500 to-emerald-500";
    if (status === "draft") return "from-slate-500 to-gray-500";
    return "from-amber-500 to-orange-500";
  };

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Assessments"
        subtitle="Create, manage, and monitor all course assessments and student submissions."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: totalAssessments, icon: FileText, color: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10" },
          { label: "Published", value: publishedAssessments, icon: CheckCircle, color: "from-green-500 to-emerald-500", bg: "from-green-500/10 to-emerald-500/10" },
          { label: "AI-Generated", value: aiGenerated, icon: Zap, color: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10" },
          { label: "Submissions", value: totalSubmissions, icon: BarChart3, color: "from-orange-500 to-red-500", bg: "from-orange-500/10 to-red-500/10" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`rounded-xl p-4 bg-gradient-to-br ${stat.bg} border border-gradient-to-r ${stat.color} border-opacity-10`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between font-semibold ${alert.type === "success" ? "bg-green-100/80 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100/80 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400"}`}>
          <span>{alert.msg}</span>
          <button type="button" onClick={() => setAlert(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full">
          <SearchBar 
            value={search}
            onChange={setSearch}
            placeholder="Search assessments…"
          />
        </div>
        <button 
          type="button" 
          onClick={() => setShowCreate(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Create Assessment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All Assessments" },
          { id: "published", label: "Published" },
          { id: "draft", label: "Drafts" },
          { id: "ai", label: "AI-Generated" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              filter === f.id
                ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg"
                : "bg-card border border-border text-muted-foreground hover:border-[#E8A020]/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Assessments Grid */}
      <div className="grid gap-6">
        {filteredAssessments.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No assessments found"
            description={search ? `No assessments match "${search}".` : "Create your first assessment to start evaluating student learning."}
            action={<button type="button" onClick={() => setShowCreate(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition">Create Assessment</button>}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => {
              const submissions = state.submissions.filter((s) => s.assessmentId === assessment.id);
              const isAI = assessment.generatedFrom.toLowerCase().includes("ai");
              
              return (
                <div key={assessment.id} className="group rounded-xl border border-border hover:border-[#E8A020]/50 bg-card overflow-hidden hover:shadow-lg transition-all">
                  {/* Header with Type Badge */}
                  <div className={`relative h-24 bg-gradient-to-br ${getTypeColor(assessment.type)} flex items-center justify-center p-4`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative text-center">
                      <span className="text-4xl">{getTypeIcon(assessment.type)}</span>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {isAI && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-purple-500/90 text-white">✨ AI</span>
                      )}
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        assessment.status === "published" 
                          ? "bg-green-500/90 text-white" 
                          : "bg-slate-500/90 text-white"
                      }`}>
                        {assessment.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1 line-clamp-2">{assessment.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{assessment.generatedFrom}</p>

                    {/* Details Grid */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-semibold">{assessment.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Questions</span>
                        <span className="font-semibold">{assessment.questionCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Submissions</span>
                        <span className="font-semibold">{submissions.length}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => handleView(assessment)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 font-semibold text-xs transition disabled:opacity-50"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleEditClick(assessment)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 font-semibold text-xs transition disabled:opacity-50"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteClick(assessment)}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 font-semibold text-xs transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-2xl text-foreground">Edit Assessment</h2>
              <button type="button" onClick={() => setShowEdit(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Type</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Essay">Essay</option>
                  <option value="Short Answer">Short Answer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Passing Mark (%)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={editForm.passing_mark}
                  onChange={(e) => setEditForm({ ...editForm, passing_mark: parseInt(e.target.value) || 0 })}
                  min={0} max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Total Marks</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={editForm.total_marks}
                  onChange={(e) => setEditForm({ ...editForm, total_marks: parseInt(e.target.value) || 100 })}
                  min={1}
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full">
            <div className="p-6">
              <h2 className="font-serif text-2xl text-foreground mb-2">Delete Assessment?</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedAssessment.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowDelete(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground">Create Assessment</h2>
                <p className="text-sm text-muted-foreground mt-1">Set up a new assessment for your courses</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                ✕
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Assessment Title *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  placeholder="e.g. Chapter 5 Quiz" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Assessment Type *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition"
                >
                  <option value="">Select type</option>
                  <option value="quiz">Quiz</option>
                  <option value="essay">Essay</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Question Count *</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  placeholder="Number of questions" 
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Generation Method</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition"
                >
                  <option value="manual">Manual</option>
                  <option value="ai">AI-Generated</option>
                  <option value="question-bank">Question Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Associated Course *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition"
                >
                  <option value="">Select course</option>
                  {state.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Pass Score (%)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  placeholder="70" 
                  min={0}
                  max={100}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition"
                >
                  Create Assessment
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
