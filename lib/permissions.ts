export type UserRole = "estudante" | "professor" | "visitante" | "bibliotecario"

export interface Permission {
  canViewUsers: boolean
  canManageUsers: boolean
  canViewAllLoans: boolean
  canManageLoans: boolean
  canViewReports: boolean
  canViewCatalog: boolean
  canViewOwnLoans: boolean
}

export const PERMISSIONS: Record<UserRole, Permission> = {
  bibliotecario: {
    canViewUsers: true,
    canManageUsers: true,
    canViewAllLoans: true,
    canManageLoans: true,
    canViewReports: true,
    canViewCatalog: true,
    canViewOwnLoans: true,
  },
  professor: {
    canViewUsers: false,
    canManageUsers: false,
    canViewAllLoans: false,
    canManageLoans: false,
    canViewReports: false,
    canViewCatalog: true,
    canViewOwnLoans: true,
  },
  estudante: {
    canViewUsers: false,
    canManageUsers: false,
    canViewAllLoans: false,
    canManageLoans: false,
    canViewReports: false,
    canViewCatalog: true,
    canViewOwnLoans: true,
  },
  visitante: {
    canViewUsers: false,
    canManageUsers: false,
    canViewAllLoans: false,
    canManageLoans: false,
    canViewReports: false,
    canViewCatalog: true,
    canViewOwnLoans: true,
  },
}

export function getUserPermissions(role: UserRole): Permission {
  return PERMISSIONS[role]
}

export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return PERMISSIONS[role][permission]
}
