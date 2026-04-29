import type { Role } from "@/lib/mock-lms";

export function normalizeRole(role: string | null | undefined): Role {
  if (role === "teacher" || role === "student") {
    return role;
  }
  return "admin";
}

export function canAccessRolePath(role: string | null | undefined, pathname: string): boolean {
  const normalized = normalizeRole(role);

  if (pathname.startsWith("/admin")) {
    return normalized === "admin";
  }
  if (pathname.startsWith("/teacher")) {
    return normalized === "teacher";
  }
  if (pathname.startsWith("/student")) {
    return normalized === "student";
  }
  return true;
}

export function rolePrefix(role: string | null | undefined): "/admin" | "/teacher" | "/student" {
  const normalized = normalizeRole(role);
  if (normalized === "teacher") return "/teacher";
  if (normalized === "student") return "/student";
  return "/admin";
}
