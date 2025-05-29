"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Plus, Search, Edit, Package, BarChart3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { acervoService } from "@/lib/services/acervo-service"
import type { ItemAcervo } from "@/lib/database"
import { usePermissions } from "@/hooks/use-permissions"

export default function AcervoPage() {
  const { canManageUsers } = usePermissions()
  const [itens, setItens] = useState<ItemAcervo[]>([])
  const [filtro, setFiltro] = useState("")
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [itemSelecionado, setItemSelecionado] = useState<ItemAcervo | null>(null)
  const [novaQuantidade, setNovaQuantidade] = useState("")
  const { toast } = useToast()

  const [novoItem, setNovoItem] = useState({
    titulo: "",
    isbn: "",
    codigo: "",
    autor: "",
    categoria: "",
    quantidadeTotal: 1,
  })

  useEffect(() => {
    if (canManageUsers) {
      carregarDados()
    }
  }, [canManageUsers])

  const carregarDados = async () => {
    const resultadoItens = await acervoService.consultarItens()
    if (resultadoItens.sucesso && resultadoItens.itens) {
      setItens(resultadoItens.itens)
    }

    const resultadoEstatisticas = await acervoService.obterEstatisticas()
    if (resultadoEstatisticas.sucesso && resultadoEstatisticas.estatisticas) {
      setEstatisticas(resultadoEstatisticas.estatisticas)
    }
  }

  const buscarItens = async () => {
    if (!filtro.trim()) {
      carregarDados()
      return
    }

    const resultado = await acervoService.consultarItens({ titulo: filtro })
    if (resultado.sucesso && resultado.itens) {
      setItens(resultado.itens)
    }
  }

  const adicionarItem = async () => {
    const resultado = await acervoService.adicionarItem(novoItem)

    if (resultado.sucesso) {
      toast({
        title: "Item adicionado",
        description: "Item adicionado ao acervo com sucesso!",
      })
      setNovoItem({
        titulo: "",
        isbn: "",
        codigo: "",
        autor: "",
        categoria: "",
        quantidadeTotal: 1,
      })
      carregarDados()
    } else {
      toast({
        title: "Erro ao adicionar item",
        description: resultado.erro,
        variant: "destructive",
      })
    }
  }

  const atualizarQuantidade = async () => {
    if (!itemSelecionado || !novaQuantidade) return

    const quantidade = Number.parseInt(novaQuantidade)
    if (isNaN(quantidade) || quantidade < 0) {
      toast({
        title: "Quantidade inválida",
        description: "Digite uma quantidade válida",
        variant: "destructive",
      })
      return
    }

    const resultado = await acervoService.atualizarQuantidade(itemSelecionado.id, quantidade)

    if (resultado.sucesso) {
      toast({
        title: "Quantidade atualizada",
        description: "Quantidade do item atualizada com sucesso!",
      })
      setItemSelecionado(null)
      setNovaQuantidade("")
      carregarDados()
    } else {
      toast({
        title: "Erro ao atualizar quantidade",
        description: resultado.erro,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (item: ItemAcervo) => {
    if (item.quantidadeDisponivel === 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Sem Estoque
        </Badge>
      )
    } else if (item.quantidadeDisponivel <= 2) {
      return (
        <Badge variant="secondary" className="text-xs">
          Estoque Baixo
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="text-xs">
          Disponível
        </Badge>
      )
    }
  }

  if (!canManageUsers) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão do Acervo</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Controle de livros, quantidades e disponibilidade</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full sm:w-auto text-sm">
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Adicionar Novo Item ao Acervo</DialogTitle>
              <DialogDescription className="text-sm">
                Preencha os dados do livro e a quantidade inicial.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="titulo" className="text-sm">
                  Título *
                </Label>
                <Input
                  id="titulo"
                  value={novoItem.titulo}
                  onChange={(e) => setNovoItem({ ...novoItem, titulo: e.target.value })}
                  placeholder="Título do livro"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autor" className="text-sm">
                  Autor *
                </Label>
                <Input
                  id="autor"
                  value={novoItem.autor}
                  onChange={(e) => setNovoItem({ ...novoItem, autor: e.target.value })}
                  placeholder="Nome do autor"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-sm">
                  Código *
                </Label>
                <Input
                  id="codigo"
                  value={novoItem.codigo}
                  onChange={(e) => setNovoItem({ ...novoItem, codigo: e.target.value })}
                  placeholder="Código único do livro"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn" className="text-sm">
                  ISBN
                </Label>
                <Input
                  id="isbn"
                  value={novoItem.isbn}
                  onChange={(e) => setNovoItem({ ...novoItem, isbn: e.target.value })}
                  placeholder="ISBN do livro"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm">
                  Categoria *
                </Label>
                <Input
                  id="categoria"
                  value={novoItem.categoria}
                  onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value })}
                  placeholder="Categoria do livro"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="quantidade" className="text-sm">
                  Quantidade *
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={novoItem.quantidadeTotal}
                  onChange={(e) => setNovoItem({ ...novoItem, quantidadeTotal: Number.parseInt(e.target.value) || 1 })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button variant="outline" className="text-sm">
                Cancelar
              </Button>
              <Button onClick={adicionarItem} className="text-sm">
                Adicionar ao Acervo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas - Grid Responsivo */}
      {estatisticas && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Total de Títulos</p>
                  <p className="text-lg sm:text-2xl font-bold">{estatisticas.totalItens}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Total Exemplares</p>
                  <p className="text-lg sm:text-2xl font-bold">{estatisticas.totalExemplares}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Disponíveis</p>
                  <p className="text-lg sm:text-2xl font-bold">{estatisticas.exemplaresDisponiveis}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Emprestados</p>
                  <p className="text-lg sm:text-2xl font-bold">{estatisticas.exemplaresEmprestados}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">Sem Estoque</p>
                  <p className="text-lg sm:text-2xl font-bold">{estatisticas.itensSemEstoque}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Busca */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Buscar no Acervo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Input
              placeholder="Digite o título do livro..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="flex-1 text-sm sm:text-base"
            />
            <div className="flex gap-2">
              <Button onClick={buscarItens} className="flex-1 sm:flex-none text-xs sm:text-sm">
                Buscar
              </Button>
              <Button variant="outline" onClick={carregarDados} className="flex-1 sm:flex-none text-xs sm:text-sm">
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="space-y-3 sm:space-y-4">
        {itens.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">{item.titulo}</h3>
                    {getStatusBadge(item)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <div className="break-words">
                      <span className="font-medium">Autor:</span> {item.autor}
                    </div>
                    <div>
                      <span className="font-medium">Código:</span> {item.codigo}
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span> {item.categoria}
                    </div>
                    {item.isbn && (
                      <div className="sm:col-span-2 lg:col-span-4 break-all">
                        <span className="font-medium">ISBN:</span> {item.isbn}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                      <span>
                        <strong>Total:</strong> {item.quantidadeTotal}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                      <span>
                        <strong>Disponível:</strong> {item.quantidadeDisponivel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                      <span>
                        <strong>Emprestado:</strong> {item.quantidadeEmprestada}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full lg:w-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemSelecionado(item)
                          setNovaQuantidade(item.quantidadeTotal.toString())
                        }}
                        className="w-full lg:w-auto text-xs sm:text-sm"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Editar Quantidade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg">Editar Quantidade</DialogTitle>
                        <DialogDescription className="text-sm">
                          Atualize a quantidade total de exemplares deste livro.
                        </DialogDescription>
                      </DialogHeader>
                      {itemSelecionado && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm sm:text-base break-words">{itemSelecionado.titulo}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">por {itemSelecionado.autor}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
                            <div>
                              <span className="font-medium">Atual:</span> {itemSelecionado.quantidadeTotal}
                            </div>
                            <div>
                              <span className="font-medium">Disponível:</span> {itemSelecionado.quantidadeDisponivel}
                            </div>
                            <div>
                              <span className="font-medium">Emprestado:</span> {itemSelecionado.quantidadeEmprestada}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="novaQuantidade" className="text-sm">
                              Nova Quantidade Total
                            </Label>
                            <Input
                              id="novaQuantidade"
                              type="number"
                              min={itemSelecionado.quantidadeEmprestada}
                              value={novaQuantidade}
                              onChange={(e) => setNovaQuantidade(e.target.value)}
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              Mínimo: {itemSelecionado.quantidadeEmprestada} (exemplares emprestados)
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <Button variant="outline" onClick={() => setItemSelecionado(null)} className="text-sm">
                              Cancelar
                            </Button>
                            <Button onClick={atualizarQuantidade} className="text-sm">
                              Atualizar
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {itens.length === 0 && (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-gray-500 text-sm sm:text-base">Nenhum item encontrado no acervo.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
