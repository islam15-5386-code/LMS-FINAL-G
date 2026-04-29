import test from "node:test";
import assert from "node:assert/strict";
import { canAccessRolePath, normalizeRole, rolePrefix } from "../src/lib/auth/role-access.ts";

test("admin sees admin area only", () => {
  assert.equal(normalizeRole("admin"), "admin");
  assert.equal(canAccessRolePath("admin", "/admin/dashboard"), true);
  assert.equal(canAccessRolePath("admin", "/teacher/dashboard"), false);
  assert.equal(canAccessRolePath("admin", "/student/dashboard"), false);
});

test("teacher sees teacher area only", () => {
  assert.equal(normalizeRole("teacher"), "teacher");
  assert.equal(canAccessRolePath("teacher", "/teacher/dashboard"), true);
  assert.equal(canAccessRolePath("teacher", "/admin/dashboard"), false);
  assert.equal(canAccessRolePath("teacher", "/student/dashboard"), false);
});

test("student sees student area only", () => {
  assert.equal(normalizeRole("student"), "student");
  assert.equal(canAccessRolePath("student", "/student/dashboard"), true);
  assert.equal(canAccessRolePath("student", "/admin/dashboard"), false);
  assert.equal(canAccessRolePath("student", "/teacher/dashboard"), false);
});

test("role prefix resolves to correct dashboard segment", () => {
  assert.equal(rolePrefix("admin"), "/admin");
  assert.equal(rolePrefix("teacher"), "/teacher");
  assert.equal(rolePrefix("student"), "/student");
});
