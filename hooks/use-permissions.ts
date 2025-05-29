"use client"

import { useAuth } from "@/contexts/auth-context"
import { getUserPermissions, hasPermission, type Permission } from "@/lib/permissions"

export function usePermissions() {
  const { user } = useAuth()

  if (!user) {
    return {
      permissions: null,
      hasPermission: () => false,
      canViewUsers: false,
      canManageUsers: false,
      canViewAllLoans: false,
      canManageLoans: false,
      canViewReports: false,
      canViewCatalog: false,
      canViewOwnLoans: false,
    }
  }

  const permissions = getUserPermissions(user.categoria)

  return {
    permissions,
    hasPermission: (permission: keyof Permission) => hasPermission(user.categoria, permission),
    canViewUsers: permissions.canViewUsers,
    canManageUsers: permissions.canManageUsers,
    canViewAllLoans: permissions.canViewAllLoans,
    canManageLoans: permissions.canManageLoans,
    canViewReports: permissions.canViewReports,
    canViewCatalog: permissions.canViewCatalog,
    canViewOwnLoans: permissions.canViewOwnLoans,
  }
}
