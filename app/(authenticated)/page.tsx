"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, UserPlus, FileText, Library, User, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const { user } = useAuth()
  const { canViewUsers, canViewReports, canViewCatalog, canViewOwnLoans } = usePermissions()

  if (!user) return null

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Boas-vindas - Responsivo */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Bem-vindo, {user.nome.split(" ")[0]}!
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Badge variant="secondary" className={cn("text-xs sm:text-sm", getCategoryColor(user.categoria))}>
              {getCategoryLabel(user.categoria)}
            </Badge>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
            {user.categoria === "estudante" || user.categoria === "professor" || user.categoria === "visitante"
              ? "Acesse nosso acervo digital, gerencie seus empréstimos e explore milhares de títulos disponíveis"
              : "Plataforma completa para administração bibliotecária: controle de usuários, empréstimos, acervo e relatórios em tempo real"}
          </p>
        </div>

        {/* Cards de Funcionalidades - Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Catálogo - Todos podem ver */}
          {canViewCatalog && (
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Library className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span className="leading-tight">Catálogo de Livros</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Explore nosso acervo e solicite empréstimos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/catalogo">
                  <Button className="w-full text-xs sm:text-sm h-8 sm:h-9">Acessar Catálogo</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Perfil - Todos podem ver */}
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="leading-tight">Meu Perfil</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Gerencie suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/perfil">
                <Button variant="outline" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                  Ver Perfil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Gestão de Usuários - Apenas bibliotecários */}
          {canViewUsers && (
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <span className="leading-tight">Gestão de Usuários</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Cadastre, consulte e gerencie usuários da biblioteca
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/usuarios">
                  <Button className="w-full text-xs sm:text-sm h-8 sm:h-9">Acessar Usuários</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Consultas e Relatórios - Apenas bibliotecários */}
          {canViewReports && (
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  <span className="leading-tight">Consultas e Relatórios</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Busque informações de usuários e empréstimos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/consultas">
                  <Button className="w-full text-xs sm:text-sm h-8 sm:h-9">Fazer Consultas</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Informações específicas por tipo de usuário - Responsivo */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            {user.categoria === "bibliotecario" ? "Recursos do Sistema" : "O que você pode fazer"}
          </h2>

          {user.categoria === "bibliotecario" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Gestão Completa de Usuários</h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 leading-relaxed">
                  <li>• Cadastro e validação automática de CPF</li>
                  <li>• Busca avançada por múltiplos critérios</li>
                  <li>• Histórico completo de alterações</li>
                  <li>• Controle de status e permissões</li>
                </ul>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Sistema Inteligente de Empréstimos</h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 leading-relaxed">
                  <li>• Prazos automáticos por categoria de usuário</li>
                  <li>• Controle de disponibilidade em tempo real</li>
                  <li>• Relatórios e estatísticas detalhadas</li>
                  <li>• Alertas de vencimento e atrasos</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Explore o Acervo Digital</h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 leading-relaxed">
                  <li>• Busca inteligente por título, autor ou categoria</li>
                  <li>• Visualização de disponibilidade em tempo real</li>
                  <li>• Solicitação de empréstimos com um clique</li>
                  <li>• Informações detalhadas de cada publicação</li>
                </ul>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Gerencie Seus Empréstimos</h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 leading-relaxed">
                  <li>• Acompanhe todos os seus livros emprestados</li>
                  <li>• Receba lembretes de datas de devolução</li>
                  <li>• Acesse seu histórico completo de leituras</li>
                  <li>• Renove empréstimos quando possível</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Informações de contato - Responsivo */}
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">Precisa de Ajuda?</h3>
          <p className="text-blue-700 text-xs sm:text-sm mb-3 leading-relaxed">
            Nossa equipe está sempre disponível para ajudar você com qualquer dúvida sobre o sistema.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-blue-600">
            <div className="flex items-center gap-1 sm:gap-2">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Segunda a Sexta: 7h às 22h</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span>📞 (91) 3210-8000</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span>📧 biblioteca@cesupa.br</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
