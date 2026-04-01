import { describe, it, expect } from "vitest";
import { hasRole, requireRole, ROLES } from "@/lib/rbac";
import type { AuthUser } from "@/lib/auth";

function makeUser(role: string): AuthUser {
  return { id: 1, name: "Test", email: "test@test.com", role };
}

describe("hasRole", () => {
  it("should return true when user has one of the allowed roles", () => {
    const user = makeUser("MANAGER");
    expect(hasRole(user, [ROLES.MANAGER, ROLES.ADMIN])).toBe(true);
  });

  it("should return false when user does not have allowed role", () => {
    const user = makeUser("EMPLOYEE");
    expect(hasRole(user, [ROLES.MANAGER, ROLES.FINANCE])).toBe(false);
  });

  it("should return true for exact role match", () => {
    const user = makeUser("ADMIN");
    expect(hasRole(user, [ROLES.ADMIN])).toBe(true);
  });

  it("should return false for empty allowed roles", () => {
    const user = makeUser("ADMIN");
    expect(hasRole(user, [])).toBe(false);
  });
});

describe("requireRole", () => {
  it("should not throw when user has the required role", () => {
    const user = makeUser("FINANCE");
    expect(() => requireRole(user, [ROLES.FINANCE])).not.toThrow();
  });

  it("should throw Forbidden when user lacks required role", () => {
    const user = makeUser("EMPLOYEE");
    expect(() => requireRole(user, [ROLES.ADMIN])).toThrow("Forbidden");
  });

  it("should accept user with any of multiple allowed roles", () => {
    const user = makeUser("MANAGER");
    expect(() =>
      requireRole(user, [ROLES.MANAGER, ROLES.FINANCE, ROLES.ADMIN]),
    ).not.toThrow();
  });
});
