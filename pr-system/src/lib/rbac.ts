import type { AuthUser } from "./auth";

export const ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  FINANCE: "FINANCE",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function hasRole(user: AuthUser, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role as UserRole);
}

export function requireRole(user: AuthUser, allowedRoles: UserRole[]): void {
  if (!hasRole(user, allowedRoles)) {
    throw new Error("Forbidden");
  }
}

export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  FINANCE: "Finance",
  ADMIN: "Admin",
};
