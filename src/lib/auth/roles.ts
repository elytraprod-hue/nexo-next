export type UserRole = "owner" | "admin" | "member" | "client" | "viewer";
export type MemberStatus = "active" | "pending" | "blocked";

const DEFAULT_ROLE: UserRole = "member";

export function normalizeRole(role?: string | null): UserRole {
  if (role === "owner" || role === "admin" || role === "member" || role === "client" || role === "viewer") return role;
  return DEFAULT_ROLE;
}

export function isOwnerRole(role?: string | null) {
  return normalizeRole(role) === "owner";
}

export function isAdminRole(role?: string | null) {
  const nextRole = normalizeRole(role);
  return nextRole === "owner" || nextRole === "admin";
}

export function normalizeMemberStatus(status?: string | null): MemberStatus {
  if (status === "active" || status === "pending" || status === "blocked") return status;
  return "active";
}

export function canAccessInternal(role?: string | null, status?: string | null) {
  if (!role) return false;
  if (normalizeMemberStatus(status) !== "active") return false;
  const nextRole = normalizeRole(role);
  return nextRole === "owner" || nextRole === "admin" || nextRole === "member";
}

export function canAccessAdmin(role?: string | null, status?: string | null) {
  return normalizeMemberStatus(status) === "active" && isAdminRole(role);
}
