export const UserRole = {
  ADMIN: 'ADMIN',
  PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
  PROCUREMENT_USER: 'PROCUREMENT_USER',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ALL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.PROCUREMENT_MANAGER,
  UserRole.PROCUREMENT_USER,
  UserRole.VIEWER,
];
