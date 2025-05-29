import { BookOpen, FileText, Search, UserPlus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistema de Gestão de Biblioteca CESUPA</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modernize o gerenciamento da sua biblioteca com nosso sistema completo para usuários, empréstimos e acervo
            bibliográfico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>Cadastre, consulte e gerencie usuários da biblioteca</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/usuarios">
                <Button className="w-full">Acessar Usuários</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Empréstimos
              </CardTitle>
              <CardDescription>Registre e controle empréstimos de livros</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/emprestimos">
                <Button className="w-full">Gerenciar Empréstimos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-purple-600" />
                Consultas
              </CardTitle>
              <CardDescription>Busque informações de usuários e empréstimos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/consultas">
                <Button className="w-full">Fazer Consultas</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Funcionalidades do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Gestão de Usuários</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cadastro completo com validação de CPF</li>
                <li>• Consulta por nome, CPF, ID ou matrícula</li>
                <li>• Atualização de dados com histórico</li>
                <li>• Inativação lógica de cadastros</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Sistema de Empréstimos</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Registro de empréstimos com validações</li>
                <li>• Controle de prazos por categoria</li>
                <li>• Verificação de disponibilidade</li>
                <li>• Histórico completo de transações</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
