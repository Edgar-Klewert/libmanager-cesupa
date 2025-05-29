"use client"

import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
}

const publicRoutes = ["/login", "/registro", "/recuperar-senha"]

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login")
      } else if (isAuthenticated && isPublicRoute) {
        router.push("/")
      }
    }
  }, [isAuthenticated, loading, pathname, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado e não é rota pública, não renderizar nada (redirecionamento acontecerá)
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null
  }

  // Se está autenticado e é rota pública, não renderizar nada (redirecionamento acontecerá)
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
