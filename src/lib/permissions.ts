import { UserRole } from "@prisma/client";

export const CONTENT_MANAGER_ROLES = [UserRole.ADMIN, UserRole.EDITOR];
export const MEMBER_MANAGER_ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.STAFF];
export const EVENT_MANAGER_ROLES = [UserRole.ADMIN, UserRole.EDITOR, UserRole.STAFF];
export const DASHBOARD_ROLES = [
  UserRole.ADMIN,
  UserRole.EDITOR,
  UserRole.STAFF,
  UserRole.VIEWER,
];

export function hasRole(role: UserRole | undefined, roles: UserRole[]) {
  return Boolean(role && roles.includes(role));
}

export function canDeleteMember(role: UserRole | undefined) {
  return role === UserRole.ADMIN || role === UserRole.STAFF;
}

export function canManageContent(role: UserRole | undefined) {
  return hasRole(role, CONTENT_MANAGER_ROLES) || role === UserRole.ADMIN;
}