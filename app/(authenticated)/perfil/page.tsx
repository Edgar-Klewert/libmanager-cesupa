"use client"

import { Edit, Save, User, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatarCPF } from "@/lib/validations"

interface DadosEdicao {
  nome: string
  email: string
}

export default function PerfilPage() {
  const { user } = useAuth()
  const [editando, setEditando] = useState(false)
  const [dadosEdicao, setDadosEdicao] = useState<DadosEdicao>({
    nome: user?.nome || "",
    email: user?.email || "",
  })
  const { toast } = useToast()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Usuário não encontrado.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSalvar = async () => {
    try {
      // Aqui você faria a chamada para atualizar os dados do usuário
      // await updateUser(user.id, dadosEdicao)

      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram atualizados com sucesso!",
      })
      setEditando(false)
    } catch {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seus dados",
        variant: "destructive",
      })
    }
  }

  const handleCancelar = () => {
    setDadosEdicao({
      nome: user.nome,
      email: user.email,
    })
    setEditando(false)
  }

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      bibliotecario: "bg-purple-100 text-purple-800",
      professor: "bg-blue-100 text-blue-800",
      estudante: "bg-green-100 text-green-800",
      visitante: "bg-gray-100 text-gray-800",
    }
    return colors[categoria] || "bg-gray-100 text-gray-800"
  }

  const getCategoryLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      bibliotecario: "Bibliotecário",
      professor: "Professor",
      estudante: "Estudante",
      visitante: "Visitante",
    }
    return labels[categoria] || categoria
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>Seus dados cadastrais no sistema</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getCategoryColor(user.categoria)}>
                  {getCategoryLabel(user.categoria)}
                </Badge>
                {!editando ? (
                  <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelar}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSalvar}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                {editando ? (
                  <Input
                    id="nome"
                    value={dadosEdicao.nome}
                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{user.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {editando ? (
                  <Input
                    id="email"
                    type="email"
                    value={dadosEdicao.email}
                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, email: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{user.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>CPF</Label>
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{formatarCPF(user.cpf)}</p>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{getCategoryLabel(user.categoria)}</p>
              </div>

              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded font-mono">{user.id}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Informações do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status da Conta:</span>
                  <Badge variant="default" className="ml-2">
                    Ativa
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Último Acesso:</span>
                  <span className="ml-2 text-gray-600">Agora</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Segurança */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Gerencie a segurança da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Alterar Senha
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Para alterar sua senha, entre em contato com a administração da biblioteca.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
