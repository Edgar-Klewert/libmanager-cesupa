"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Plus, Search, User, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { emprestimoService } from "@/lib/services/emprestimo-service"
import { usuarioService } from "@/lib/services/usuario-service"
import { db, type Emprestimo, type Usuario, type ItemAcervo } from "@/lib/database"

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [itens, setItens] = useState<ItemAcervo[]>([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [itemSelecionado, setItemSelecionado] = useState<ItemAcervo | null>(null)
  const [buscaUsuario, setBuscaUsuario] = useState("")
  const [buscaItem, setBuscaItem] = useState("")
  const { toast } = useToast()
  const [devolucaoLoading, setDevolucaoLoading] = useState<string | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    const resultadoEmprestimos = await emprestimoService.consultarEmprestimos()
    if (resultadoEmprestimos.sucesso && resultadoEmprestimos.emprestimos) {
      setEmprestimos(resultadoEmprestimos.emprestimos)
    }

    const resultadoUsuarios = await usuarioService.consultarUsuarios()
    if (resultadoUsuarios.sucesso && resultadoUsuarios.usuarios) {
      setUsuarios(resultadoUsuarios.usuarios.filter((u) => u.ativo))
    }

    const itensDisponiveis = await db.buscarItens()
    setItens(itensDisponiveis)
  }

  const buscarUsuarios = async () => {
    if (!buscaUsuario.trim()) return

    const resultado = await usuarioService.consultarUsuarios({ nome: buscaUsuario })
    if (resultado.sucesso && resultado.usuarios) {
      const usuariosAtivos = resultado.usuarios.filter((u) => u.ativo)
      setUsuarios(usuariosAtivos)
    }
  }

  const buscarItens = async () => {
    if (!buscaItem.trim()) return

    const itensEncontrados = await db.buscarItens({ titulo: buscaItem })
    setItens(itensEncontrados)
  }

  const registrarEmprestimo = async () => {
    if (!usuarioSelecionado || !itemSelecionado) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um usuário e um item para o empréstimo.",
        variant: "destructive",
      })
      return
    }

    const resultado = await emprestimoService.registrarEmprestimo({
      usuarioId: usuarioSelecionado.id,
      itemId: itemSelecionado.id,
      bibliotecario: "Bibliotecário Sistema",
    })

    if (resultado.sucesso) {
      toast({
        title: "Empréstimo registrado",
        description: "Empréstimo registrado com sucesso!",
      })
      setUsuarioSelecionado(null)
      setItemSelecionado(null)
      setBuscaUsuario("")
      setBuscaItem("")
      carregarDados()
    } else {
      toast({
        title: "Erro no empréstimo",
        description: resultado.erro,
        variant: "destructive",
      })
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

  const devolverEmprestimo = async (emprestimoId: string) => {
    setDevolucaoLoading(emprestimoId)
    try {
      const resultado = await emprestimoService.devolverEmprestimo(emprestimoId)

      if (resultado.sucesso) {
        toast({
          title: "Livro devolvido",
          description: "Devolução registrada com sucesso!",
        })
        carregarDados()
      } else {
        toast({
          title: "Erro na devolução",
          description: resultado.erro,
          variant: "destructive",
        })
      }
    } finally {
      setDevolucaoLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Empréstimos</h1>
          <p className="text-gray-600 mt-2">Registre e controle empréstimos de livros</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Empréstimo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Registrar Novo Empréstimo</DialogTitle>
              <DialogDescription>Selecione o usuário e o item para registrar o empréstimo.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              {/* Seleção de Usuário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buscaUsuario">Buscar Usuário</Label>
                  <div className="flex gap-2">
                    <Input
                      id="buscaUsuario"
                      value={buscaUsuario}
                      onChange={(e) => setBuscaUsuario(e.target.value)}
                      placeholder="Nome do usuário..."
                    />
                    <Button onClick={buscarUsuarios} size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {usuarioSelecionado ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Usuário Selecionado</span>
                      </div>
                      <p className="font-semibold">{usuarioSelecionado.nome}</p>
                      <p className="text-sm text-gray-600">CPF: {usuarioSelecionado.cpf}</p>
                      <p className="text-sm text-gray-600">Categoria: {usuarioSelecionado.categoria}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setUsuarioSelecionado(null)}>
                        Alterar
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usuarios.map((usuario) => (
                      <Card
                        key={usuario.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setUsuarioSelecionado(usuario)}
                      >
                        <CardContent className="p-3">
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-gray-600">
                            {usuario.categoria} - {usuario.cpf}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Seleção de Item */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buscaItem">Buscar Item</Label>
                  <div className="flex gap-2">
                    <Input
                      id="buscaItem"
                      value={buscaItem}
                      onChange={(e) => setBuscaItem(e.target.value)}
                      placeholder="Título do livro..."
                    />
                    <Button onClick={buscarItens} size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {itemSelecionado ? (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Item Selecionado</span>
                      </div>
                      <p className="font-semibold">{itemSelecionado.titulo}</p>
                      <p className="text-sm text-gray-600">Autor: {itemSelecionado.autor}</p>
                      <p className="text-sm text-gray-600">Código: {itemSelecionado.codigo}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setItemSelecionado(null)}>
                        Alterar
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {itens
                      .filter((item) => item.quantidadeDisponivel > 0)
                      .map((item) => (
                        <Card
                          key={item.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setItemSelecionado(item)}
                        >
                          <CardContent className="p-3">
                            <p className="font-medium">{item.titulo}</p>
                            <p className="text-sm text-gray-600">
                              {item.autor} - {item.codigo}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline">{item.quantidadeDisponivel} disponível(is)</Badge>
                              <span className="text-xs text-gray-500">Total: {item.quantidadeTotal}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={registrarEmprestimo} disabled={!usuarioSelecionado || !itemSelecionado}>
                Registrar Empréstimo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Empréstimos */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Empréstimos Ativos
            </CardTitle>
            <CardDescription>Lista de todos os empréstimos registrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {emprestimos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum empréstimo registrado.</p>
            ) : (
              <div className="space-y-4">
                {emprestimos.map((emprestimo) => {
                  const usuario = usuarios.find((u) => u.id === emprestimo.usuarioId)
                  const item = itens.find((i) => i.id === emprestimo.itemId)

                  return (
                    <Card key={emprestimo.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{item?.titulo || "Item não encontrado"}</h3>
                              {getStatusBadge(emprestimo)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Usuário:</span>{" "}
                                {usuario?.nome || "Usuário não encontrado"}
                              </div>
                              <div>
                                <span className="font-medium">Empréstimo:</span>{" "}
                                {formatarData(emprestimo.dataEmprestimo)}
                              </div>
                              <div>
                                <span className="font-medium">Devolução:</span>{" "}
                                {formatarData(emprestimo.dataDevolucaoPrevista)}
                              </div>
                              <div>
                                <span className="font-medium">Bibliotecário:</span> {emprestimo.bibliotecario}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatarData(emprestimo.criadoEm)}

                            {emprestimo.status === "ativo" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => devolverEmprestimo(emprestimo.id)}
                                disabled={devolucaoLoading === emprestimo.id}
                                className="ml-2"
                              >
                                {devolucaoLoading === emprestimo.id ? "Devolvendo..." : "Devolver"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
