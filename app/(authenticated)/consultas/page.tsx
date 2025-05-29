"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Users, BookOpen, BarChart3 } from "lucide-react"
import { usuarioService } from "@/lib/services/usuario-service"
import { emprestimoService } from "@/lib/services/emprestimo-service"
import type { Usuario, Emprestimo } from "@/lib/database"
import { formatarCPF } from "@/lib/validations"
import { usePermissions } from "@/hooks/use-permissions"

export default function ConsultasPage() {
  const { canViewReports } = usePermissions()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [filtroUsuario, setFiltroUsuario] = useState("")
  const [tipoFiltroUsuario, setTipoFiltroUsuario] = useState("nome")
  const [filtroEmprestimo, setFiltroEmprestimo] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [podeAcessar, setPodeAcessar] = useState(canViewReports)

  useEffect(() => {
    setPodeAcessar(canViewReports)
  }, [canViewReports])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    const resultadoUsuarios = await usuarioService.consultarUsuarios()
    if (resultadoUsuarios.sucesso && resultadoUsuarios.usuarios) {
      setUsuarios(resultadoUsuarios.usuarios)
    }

    const resultadoEmprestimos = await emprestimoService.consultarEmprestimos()
    if (resultadoEmprestimos.sucesso && resultadoEmprestimos.emprestimos) {
      setEmprestimos(resultadoEmprestimos.emprestimos)
    }
  }

  const buscarUsuarios = async () => {
    if (!filtroUsuario.trim()) {
      carregarDados()
      return
    }

    const filtroObj = { [tipoFiltroUsuario]: filtroUsuario }
    const resultado = await usuarioService.consultarUsuarios(filtroObj)

    if (resultado.sucesso && resultado.usuarios) {
      setUsuarios(resultado.usuarios)
    }
  }

  const buscarEmprestimos = async () => {
    const filtroObj: any = {}

    if (statusFiltro !== "todos") {
      filtroObj.status = statusFiltro
    }

    const resultado = await emprestimoService.consultarEmprestimos(filtroObj)

    if (resultado.sucesso && resultado.emprestimos) {
      let emprestimosFiltrados = resultado.emprestimos

      if (filtroEmprestimo.trim()) {
        const usuariosFiltrados = usuarios.filter((u) => u.nome.toLowerCase().includes(filtroEmprestimo.toLowerCase()))
        const idsUsuarios = usuariosFiltrados.map((u) => u.id)
        emprestimosFiltrados = emprestimosFiltrados.filter((e) => idsUsuarios.includes(e.usuarioId))
      }

      setEmprestimos(emprestimosFiltrados)
    }
  }

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (emprestimo: Emprestimo) => {
    const hoje = new Date()
    const dataDevolucao = new Date(emprestimo.dataDevolucaoPrevista)

    if (emprestimo.status === "devolvido") {
      return <Badge variant="default">Devolvido</Badge>
    }

    if (hoje > dataDevolucao) {
      return <Badge variant="destructive">Atrasado</Badge>
    }

    return <Badge variant="secondary">Ativo</Badge>
  }

  const estatisticas = {
    totalUsuarios: usuarios.length,
    usuariosAtivos: usuarios.filter((u) => u.ativo).length,
    totalEmprestimos: emprestimos.length,
    emprestimosAtivos: emprestimos.filter((e) => e.status === "ativo").length,
    emprestimosAtrasados: emprestimos.filter((e) => {
      const hoje = new Date()
      const dataDevolucao = new Date(e.dataDevolucaoPrevista)
      return e.status === "ativo" && hoje > dataDevolucao
    }).length,
  }

  if (!podeAcessar) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Consultas e Relatórios</h1>
        <p className="text-gray-600 mt-2">Busque informações de usuários e empréstimos</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Usuários</p>
                <p className="text-2xl font-bold">{estatisticas.totalUsuarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold">{estatisticas.usuariosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Empréstimos</p>
                <p className="text-2xl font-bold">{estatisticas.totalEmprestimos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Empréstimos Ativos</p>
                <p className="text-2xl font-bold">{estatisticas.emprestimosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Atrasados</p>
                <p className="text-2xl font-bold">{estatisticas.emprestimosAtrasados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Consulta de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Consultar Usuários
            </CardTitle>
            <CardDescription>Busque usuários por diferentes critérios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={tipoFiltroUsuario} onValueChange={setTipoFiltroUsuario}>
                <SelectTrigger className="w-32">
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
                placeholder={`Buscar por ${tipoFiltroUsuario}...`}
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="flex-1"
              />
              <Button onClick={buscarUsuarios}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {usuarios.map((usuario) => (
                <Card key={usuario.id} className="hover:bg-gray-50">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{usuario.nome}</p>
                          <Badge variant={usuario.ativo ? "default" : "secondary"}>
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline">{usuario.categoria}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">CPF: {formatarCPF(usuario.cpf)}</p>
                        {usuario.email && <p className="text-sm text-gray-600">Email: {usuario.email}</p>}
                        {usuario.matricula && <p className="text-sm text-gray-600">Matrícula: {usuario.matricula}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {usuarios.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum usuário encontrado.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Consulta de Empréstimos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Consultar Empréstimos
            </CardTitle>
            <CardDescription>Busque empréstimos por usuário e status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Filtrar por usuário</Label>
              <Input
                placeholder="Nome do usuário..."
                value={filtroEmprestimo}
                onChange={(e) => setFiltroEmprestimo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status do empréstimo</Label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="devolvido">Devolvidos</SelectItem>
                  <SelectItem value="atrasado">Atrasados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={buscarEmprestimos} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Buscar Empréstimos
            </Button>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {emprestimos.map((emprestimo) => {
                const usuario = usuarios.find((u) => u.id === emprestimo.usuarioId)

                return (
                  <Card key={emprestimo.id} className="hover:bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{usuario?.nome || "Usuário não encontrado"}</p>
                          {getStatusBadge(emprestimo)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Empréstimo:</span> {formatarData(emprestimo.dataEmprestimo)}
                        </p>
                        <p>
                          <span className="font-medium">Devolução:</span>{" "}
                          {formatarData(emprestimo.dataDevolucaoPrevista)}
                        </p>
                        <p>
                          <span className="font-medium">Bibliotecário:</span> {emprestimo.bibliotecario}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {emprestimos.length === 0 && (
                <p className="text-center text-gray-500 py-4">Nenhum empréstimo encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
