"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Search, Home, LogOut, User, Library, Package, Menu } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { canViewUsers, canViewReports, canViewCatalog } = usePermissions()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navegação para usuários autenticados
  const navigation = [
    { name: "Início", href: "/", icon: Home, show: true },
    { name: "Catálogo", href: "/catalogo", icon: Library, show: canViewCatalog },
    { name: "Acervo", href: "/acervo", icon: Package, show: canViewUsers },
    { name: "Usuários", href: "/usuarios", icon: Users, show: canViewUsers },
    { name: "Consultas", href: "/consultas", icon: Search, show: canViewReports },
  ]

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case "bibliotecario":
        return "bg-purple-100 text-purple-800"
      case "professor":
        return "bg-blue-100 text-blue-800"
      case "estudante":
        return "bg-green-100 text-green-800"
      case "visitante":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryLabel = (categoria: string) => {
    switch (categoria) {
      case "bibliotecario":
        return "Bibliotecário"
      case "professor":
        return "Professor"
      case "estudante":
        return "Estudante"
      case "visitante":
        return "Visitante"
      default:
        return categoria
    }
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - responsivo */}
          <Link href={user ? "/" : "/login"} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                Biblioteca CESUPA
              </span>
              <span className="text-xs text-gray-500 hidden sm:block lg:text-xs">Sistema de Gestão Bibliotecária</span>
            </div>
          </Link>

          {/* Conteúdo do lado direito */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {user ? (
              // Header para usuários autenticados
              <>
                {/* Navegação principal - Desktop/Tablet */}
                <nav className="hidden lg:flex items-center space-x-1">
                  {navigation
                    .filter((item) => item.show)
                    .map((item) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.name} href={item.href}>
                          <Button
                            variant={pathname === item.href ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "flex items-center gap-1 xl:gap-2 text-xs xl:text-sm px-2 xl:px-3",
                              pathname === item.href && "bg-blue-600 text-white",
                            )}
                          >
                            <Icon className="h-3 w-3 xl:h-4 xl:w-4" />
                            <span className="hidden xl:inline">{item.name}</span>
                          </Button>
                        </Link>
                      )
                    })}
                </nav>

                {/* Menu do usuário */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Badge da categoria - oculto em mobile */}
                  <Badge
                    variant="secondary"
                    className={cn("hidden sm:inline-flex text-xs px-1 sm:px-2", getCategoryColor(user.categoria))}
                  >
                    <span className="hidden md:inline">{getCategoryLabel(user.categoria)}</span>
                    <span className="md:hidden">
                      {user.categoria === "bibliotecario"
                        ? "Bib"
                        : user.categoria === "professor"
                          ? "Prof"
                          : user.categoria === "estudante"
                            ? "Est"
                            : "Vis"}
                    </span>
                  </Badge>

                  {/* Menu dropdown principal */}
                  <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                        <div className="lg:hidden">
                          <Menu className="h-4 w-4" />
                        </div>
                        <div className="hidden lg:flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="hidden xl:inline text-sm">{user.nome.split(" ")[0]}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 sm:w-64">
                      <DropdownMenuLabel>
                        <div>
                          <p className="font-medium text-sm">{user.nome}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <Badge variant="secondary" className={cn("mt-1 text-xs", getCategoryColor(user.categoria))}>
                            {getCategoryLabel(user.categoria)}
                          </Badge>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Menu mobile - navegação */}
                      <div className="lg:hidden">
                        {navigation
                          .filter((item) => item.show)
                          .map((item) => {
                            const Icon = item.icon
                            return (
                              <DropdownMenuItem key={item.name} asChild>
                                <Link
                                  href={item.href}
                                  className="flex items-center"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <Icon className="mr-2 h-4 w-4" />
                                  <span>{item.name}</span>
                                </Link>
                              </DropdownMenuItem>
                            )
                          })}
                        <DropdownMenuSeparator />
                      </div>

                      <DropdownMenuItem asChild>
                        <Link href="/perfil" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Meu Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair da Conta</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Botão de sair direto - apenas desktop */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="hidden xl:flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs px-2"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Sair</span>
                  </Button>
                </div>
              </>
            ) : (
              // Header para usuários não autenticados
              <div className="flex items-center gap-1 sm:gap-2">
                {pathname !== "/login" && (
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Entrar</span>
                    </Button>
                  </Link>
                )}
                {pathname !== "/registro" && (
                  <Link href="/registro">
                    <Button size="sm" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Registrar</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
