"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, UserPlus, Edit, UserX, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { usuarioService } from "@/lib/services/usuario-service"
import type { Usuario } from "@/lib/database"
import { formatarCPF } from "@/lib/validations"
import { usePermissions } from "@/hooks/use-permissions"

export default function UsuariosPage() {
  const { canViewUsers, canManageUsers } = usePermissions()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filtro, setFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("nome")
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const { toast } = useToast()

  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    dataNascimento: "",
    cpf: "",
    telefone: "",
    endereco: "",
    categoria: "estudante" as const,
    email: "",
    matricula: "",
    departamento: "",
  })

  const [hasPermission, setHasPermission] = useState(canViewUsers)

  useEffect(() => {
    setHasPermission(canViewUsers)
  }, [canViewUsers])

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    const resultado = await usuarioService.consultarUsuarios()
    if (resultado.sucesso && resultado.usuarios) {
      setUsuarios(resultado.usuarios)
    }
  }

  const buscarUsuarios = async () => {
    if (!filtro.trim()) {
      carregarUsuarios()
      return
    }

    const filtroObj = { [tipoFiltro]: filtro }
    const resultado = await usuarioService.consultarUsuarios(filtroObj)

    if (resultado.sucesso && resultado.usuarios) {
      setUsuarios(resultado.usuarios)
      if (resultado.usuarios.length === 0) {
        toast({
          title: "Nenhum usuário encontrado",
          description: "Tente ajustar os critérios de busca.",
        })
      }
    } else {
      toast({
        title: "Erro na busca",
        description: resultado.erro,
        variant: "destructive",
      })
    }
  }

  const cadastrarUsuario = async () => {
    const resultado = await usuarioService.cadastrarUsuario(novoUsuario)

    if (resultado.sucesso) {
      toast({
        title: "Usuário cadastrado",
        description: "Usuário cadastrado com sucesso!",
      })
      setNovoUsuario({
        nome: "",
        dataNascimento: "",
        cpf: "",
        telefone: "",
        endereco: "",
        categoria: "estudante",
        email: "",
        matricula: "",
        departamento: "",
      })
      carregarUsuarios()
    } else {
      toast({
        title: "Erro no cadastro",
        description: resultado.erro,
        variant: "destructive",
      })
    }
  }

  const atualizarUsuario = async () => {
    if (!usuarioSelecionado) return

    const resultado = await usuarioService.atualizarUsuario(usuarioSelecionado.id, usuarioSelecionado, "Bibliotecário")

    if (resultado.sucesso) {
      toast({
        title: "Usuário atualizado",
        description: "Dados atualizados com sucesso!",
      })
      setModoEdicao(false)
      carregarUsuarios()
    } else {
      toast({
        title: "Erro na atualização",
        description: resultado.erro,
        variant: "destructive",
      })
    }
  }

  const inativarUsuario = async (id: string) => {
    const resultado = await usuarioService.inativarUsuario(id, "Inativado pelo sistema", "Bibliotecário")

    if (resultado.sucesso) {
      toast({
        title: "Usuário inativado",
        description: "Usuário inativado com sucesso!",
      })
      carregarUsuarios()
    } else {
      toast({
        title: "Erro na inativação",
        description: resultado.erro,
        variant: "destructive",
      })
    }
  }

  if (!hasPermission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-2">Cadastre, consulte e gerencie usuários da biblioteca</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do usuário. Campos marcados com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                <Input
                  id="dataNascimento"
                  type="date"
                  value={novoUsuario.dataNascimento}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, dataNascimento: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={novoUsuario.cpf}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={novoUsuario.telefone}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Textarea
                  id="endereco"
                  value={novoUsuario.endereco}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, endereco: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={novoUsuario.categoria}
                  onValueChange={(value: any) => setNovoUsuario({ ...novoUsuario, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estudante">Estudante</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="visitante">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  value={novoUsuario.matricula}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, matricula: e.target.value })}
                  placeholder="Matrícula institucional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento/Curso</Label>
                <Input
                  id="departamento"
                  value={novoUsuario.departamento}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, departamento: e.target.value })}
                  placeholder="Departamento ou curso"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={cadastrarUsuario}>Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome</SelectItem>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="matricula">Matrícula</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Buscar por ${tipoFiltro}...`}
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1"
            />
            <Button onClick={buscarUsuarios}>Buscar</Button>
            <Button variant="outline" onClick={carregarUsuarios}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {usuarios.map((usuario) => (
          <Card key={usuario.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{usuario.nome}</h3>
                    <Badge variant={usuario.ativo ? "default" : "secondary"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{usuario.categoria}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">CPF:</span> {formatarCPF(usuario.cpf)}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {usuario.telefone}
                    </div>
                    {usuario.email && (
                      <div>
                        <span className="font-medium">Email:</span> {usuario.email}
                      </div>
                    )}
                    {usuario.matricula && (
                      <div>
                        <span className="font-medium">Matrícula:</span> {usuario.matricula}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setUsuarioSelecionado(usuario)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Usuário</DialogTitle>
                      </DialogHeader>
                      {usuarioSelecionado && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Nome Completo</Label>
                              {modoEdicao ? (
                                <Input
                                  value={usuarioSelecionado.nome}
                                  onChange={(e) =>
                                    setUsuarioSelecionado({ ...usuarioSelecionado, nome: e.target.value })
                                  }
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{usuarioSelecionado.nome}</p>
                              )}
                            </div>
                            <div>
                              <Label>CPF</Label>
                              <p className="text-sm text-gray-600">{formatarCPF(usuarioSelecionado.cpf)}</p>
                            </div>
                            <div>
                              <Label>Telefone</Label>
                              {modoEdicao ? (
                                <Input
                                  value={usuarioSelecionado.telefone}
                                  onChange={(e) =>
                                    setUsuarioSelecionado({ ...usuarioSelecionado, telefone: e.target.value })
                                  }
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{usuarioSelecionado.telefone}</p>
                              )}
                            </div>
                            <div>
                              <Label>Email</Label>
                              {modoEdicao ? (
                                <Input
                                  value={usuarioSelecionado.email || ""}
                                  onChange={(e) =>
                                    setUsuarioSelecionado({ ...usuarioSelecionado, email: e.target.value })
                                  }
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{usuarioSelecionado.email || "Não informado"}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            {modoEdicao ? (
                              <>
                                <Button variant="outline" onClick={() => setModoEdicao(false)}>
                                  Cancelar
                                </Button>
                                <Button onClick={atualizarUsuario}>Salvar</Button>
                              </>
                            ) : (
                              <Button onClick={() => setModoEdicao(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {usuario.ativo && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => inativarUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {usuarios.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum usuário encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
