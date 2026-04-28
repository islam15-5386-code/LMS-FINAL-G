"use client";

import { useState, useMemo } from "react";
import { Users, Filter, Edit, Trash2, Eye, Plus, X } from "lucide-react";
import {
  DashboardLayout, PageHeader, SearchBar, EmptyState
} from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";

export default function AdminUsersPage() {
  const { state, getUser, updateUser, deleteUser, createUser } = useMockLms();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "teacher" | "student">("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [createForm, setCreateForm] = useState<{ name: string; email: string; password: string; role: "admin" | "teacher" | "student"; department: string }>({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: ""
  });
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string; department: string }>({ name: "", email: "", role: "student", department: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleCreateSubmit = async () => {
    try {
      setIsLoading(true);
      await createUser({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        department: createForm.department
      });
      setAlert({ type: "success", msg: `User ${createForm.name} created` });
      setShowCreate(false);
      setCreateForm({ name: "", email: "", password: "", role: "student", department: "" });
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to create user" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (user: any) => {
    try {
      setIsLoading(true);
      await getUser(user.id);
      setSelectedUser(user.id);
      setEditingUser(user);
      setShowView(true);
      setAlert({ type: "success", msg: `Viewing ${user.name}` });
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to load user details" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, department: user.department ?? "" });
    setShowEdit(true);
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;
    try {
      setIsLoading(true);
      await updateUser(editingUser.id, { name: editForm.name, email: editForm.email, role: editForm.role, department: editForm.department });
      setAlert({ type: "success", msg: `User ${editForm.name} updated` });
      setShowEdit(false);
      setEditingUser(null);
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to update user" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user: any) => {
    setEditingUser(user);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingUser) return;
    try {
      setIsLoading(true);
      await deleteUser(editingUser.id);
      setAlert({ type: "success", msg: `User ${editingUser.name} deleted` });
      setShowDelete(false);
      setEditingUser(null);
      setSelectedUser(null);
      setShowView(false);
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to delete user" });
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return state.users.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [state.users, search, roleFilter]);

  const roleCounts = useMemo(() => ({
    admin: state.users.filter((u) => u.role === "admin").length,
    teacher: state.users.filter((u) => u.role === "teacher").length,
    student: state.users.filter((u) => u.role === "student").length,
  }), [state.users]);

  function getAvatarColor(role: string) {
    if (role === "teacher") return "linear-gradient(135deg, #0f766e, #14b8a6)";
    if (role === "student") return "linear-gradient(135deg, #7c3aed, #a855f7)";
    return "linear-gradient(135deg, #1A1A2E, #E8A020)";
  }

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="User Management"
        subtitle={`${state.users.length} total users — ${roleCounts.student} students, ${roleCounts.teacher} teachers, ${roleCounts.admin} admins.`}
      />

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between font-semibold ${alert.type === "success" ? "bg-green-100/80 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100/80 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400"}`}>
          <span>{alert.msg}</span>
          <button type="button" onClick={() => setAlert(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Role summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {([
          { role: "student", label: "Students", count: roleCounts.student, color: "#7c3aed", icon: "👥" },
          { role: "teacher", label: "Teachers", count: roleCounts.teacher, color: "#0f766e", icon: "🎓" },
          { role: "admin", label: "Admins", count: roleCounts.admin, color: "#E8A020", icon: "⚙️" },
        ] as const).map(({ role, label, count, color, icon }) => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
            className={`card text-left transition-all hover:-translate-y-1 cursor-pointer group ${roleFilter === role ? "ring-2 ring-offset-1" : "hover:shadow-lg"}`}
            style={roleFilter === role ? { boxShadow: `0 0 0 2px ${color}, inset 0 0 20px ${color}20` } : undefined}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl group-hover:scale-110 transition">{icon}</span>
              <span className={`text-xs font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition`} style={{ color }}>
                {roleFilter === role ? "Active" : ""}
              </span>
            </div>
            <p className="text-3xl font-serif font-bold" style={{ color }}>{count}</p>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-[0.18em] font-semibold">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["all", "student", "teacher", "admin"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setRoleFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${roleFilter === f ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-[#E8A020]/50"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Enhanced Table */}
      <div className="card overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState icon={<Users className="w-8 h-8" />} title="No users found" description={search ? `No users match "${search}".` : "No users in this category."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-white/5">
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className={`group hover:bg-gradient-to-r hover:from-[#E8A020]/5 hover:to-transparent transition-all ${selectedUser === user.id ? "bg-[#E8A020]/10" : ""}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar w-10 h-10 text-xs shrink-0 font-bold shadow-md group-hover:shadow-lg transition" style={{ background: getAvatarColor(user.role) }}>
                          {user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground group-hover:text-[#E8A020] transition">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge capitalize font-semibold ${user.role === "admin" ? "bg-gradient-to-r from-[#E8A020]/20 to-orange-400/20 text-[#c47d0a]" : user.role === "teacher" ? "bg-gradient-to-r from-teal-500/20 to-cyan-400/20 text-teal-700" : "bg-gradient-to-r from-purple-500/20 to-blue-400/20 text-purple-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-sm">{user.department ?? "—"}</td>
                    <td className="text-muted-foreground text-sm break-all">{user.email}</td>
                    <td>
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleView(user)}
                          disabled={isLoading}
                          type="button"
                          className="p-2 rounded-lg bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 transition hover:scale-110 disabled:opacity-50"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(user)}
                          disabled={isLoading}
                          type="button"
                          className="p-2 rounded-lg bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 transition hover:scale-110 disabled:opacity-50"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={isLoading}
                          type="button"
                          className="p-2 rounded-lg bg-red-500/15 text-red-600 hover:bg-red-500/25 transition hover:scale-110 disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl text-foreground">Add User</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateSubmit(); }} className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                <input type="text" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as "admin" | "teacher" | "student" })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60">
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Department</label>
                <input type="text" value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold disabled:opacity-50">
                  {isLoading ? "Creating..." : "Create User"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl text-foreground">User Details</h2>
              <button type="button" onClick={() => setShowView(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div><span className="font-semibold text-foreground">Name:</span> {editingUser.name}</div>
              <div><span className="font-semibold text-foreground">Email:</span> {editingUser.email}</div>
              <div><span className="font-semibold text-foreground">Role:</span> {editingUser.role}</div>
              <div><span className="font-semibold text-foreground">Department:</span> {editingUser.department ?? "—"}</div>
              <div><span className="font-semibold text-foreground">User ID:</span> {editingUser.id}</div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setShowView(false)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl text-foreground">Edit User</h2>
              <button type="button" onClick={() => setShowEdit(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60">
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Department</label>
                <input type="text" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} placeholder="e.g., Engineering, Marketing" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold disabled:opacity-50">
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full">
            <div className="p-6">
              <h2 className="font-serif text-xl text-foreground mb-2">Delete User</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to permanently delete <span className="font-semibold text-foreground">"{editingUser.name}"</span>? All their data and enrollments will be removed.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={handleDeleteConfirm} disabled={isLoading} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50">
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
                <button type="button" onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
