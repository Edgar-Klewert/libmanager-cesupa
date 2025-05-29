"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Search, Calendar, User, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"
import { emprestimoService } from "@/lib/services/emprestimo-service"
import { db, type ItemAcervo, type Emprestimo } from "@/lib/database"

export default function CatalogoPage() {
  const [itens, setItens] = useState<ItemAcervo[]>([])
  const [meusEmprestimos, setMeusEmprestimos] = useState<Emprestimo[]>([])
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { canViewCatalog, canViewOwnLoans } = usePermissions()
  const { toast } = useToast()

  useEffect(() => {
    if (canViewCatalog) {
      carregarItens()
    }
    if (canViewOwnLoans && user) {
      carregarMeusEmprestimos()
    }
  }, [canViewCatalog, canViewOwnLoans, user])

  const carregarItens = async () => {
    try {
      const itensDisponiveis = await db.buscarItens()
      setItens(itensDisponiveis)
    } catch (error) {
      toast({
        title: "Erro ao carregar catálogo",
        description: "Não foi possível carregar os itens do catálogo",
        variant: "destructive",
      })
    }
  }

  const carregarMeusEmprestimos = async () => {
    if (!user) return

    try {
      const resultado = await emprestimoService.consultarEmprestimos({ usuarioId: user.id })
      if (resultado.sucesso && resultado.emprestimos) {
        setMeusEmprestimos(resultado.emprestimos)
      }
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error)
    }
  }

  const buscarItens = async () => {
    if (!filtro.trim()) {
      carregarItens()
      return
    }

    try {
      const itensEncontrados = await db.buscarItens({ titulo: filtro })
      setItens(itensEncontrados)
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca",
        variant: "destructive",
      })
    }
  }

  const solicitarEmprestimo = async (itemId: string) => {
    if (!user) return

    setLoading(true)
    try {
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId: user.id,
        itemId,
        bibliotecario: "Sistema Autoatendimento",
      })

      if (resultado.sucesso) {
        toast({
          title: "Empréstimo solicitado",
          description: "Sua solicitação foi registrada com sucesso!",
        })
        carregarItens()
        carregarMeusEmprestimos()
      } else {
        toast({
          title: "Erro na solicitação",
          description: resultado.erro,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro interno",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (emprestimo: Emprestimo) => {
    const hoje = new Date()
    const dataDevolucao = new Date(emprestimo.dataDevolucaoPrevista)

    if (emprestimo.status === "devolvido") {
      return (
        <Badge variant="default" className="text-xs">
          Devolvido
        </Badge>
      )
    }

    if (hoje > dataDevolucao) {
      return (
        <Badge variant="destructive" className="text-xs">
          Atrasado
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-xs">
        Ativo
      </Badge>
    )
  }

  const isItemEmprestado = (itemId: string) => {
    return meusEmprestimos.some((emp) => emp.itemId === itemId && emp.status === "ativo")
  }

  if (!canViewCatalog) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">Você não tem permissão para acessar o catálogo.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Catálogo da Biblioteca</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Explore nosso acervo e gerencie seus empréstimos</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Catálogo de Livros */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Busca */}
          <Card>
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
                  <Button variant="outline" onClick={carregarItens} className="flex-1 sm:flex-none text-xs sm:text-sm">
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Livros */}
          <div className="space-y-3 sm:space-y-4">
            {itens.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">{item.titulo}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={item.quantidadeDisponivel > 0 ? "default" : "secondary"}
                            className="text-xs whitespace-nowrap"
                          >
                            {item.quantidadeDisponivel > 0
                              ? `${item.quantidadeDisponivel} disponível${item.quantidadeDisponivel > 1 ? "is" : ""}`
                              : "Sem estoque"}
                          </Badge>
                        </div>
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
                        <div>
                          <span className="font-medium">Exemplares:</span> {item.quantidadeDisponivel}/
                          {item.quantidadeTotal}
                        </div>
                        {item.isbn && (
                          <div className="sm:col-span-2 lg:col-span-4 break-all">
                            <span className="font-medium">ISBN:</span> {item.isbn}
                          </div>
                        )}
                      </div>

                      {isItemEmprestado(item.id) && (
                        <Badge variant="outline" className="mb-2 text-xs">
                          Você já possui este livro emprestado
                        </Badge>
                      )}
                    </div>

                    <div className="flex-shrink-0 w-full lg:w-auto">
                      {item.quantidadeDisponivel > 0 && !isItemEmprestado(item.id) ? (
                        <Button
                          onClick={() => solicitarEmprestimo(item.id)}
                          disabled={loading}
                          className="w-full lg:w-auto text-xs sm:text-sm"
                        >
                          {loading ? "Solicitando..." : "Solicitar Empréstimo"}
                        </Button>
                      ) : (
                        <Button disabled variant="outline" className="w-full lg:w-auto text-xs sm:text-sm">
                          {item.quantidadeDisponivel === 0 ? "Sem estoque" : "Indisponível"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {itens.length === 0 && (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <p className="text-gray-500 text-sm sm:text-base">Nenhum item encontrado no catálogo.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Meus Empréstimos */}
        {canViewOwnLoans && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  Meus Empréstimos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Acompanhe seus livros emprestados</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {meusEmprestimos.length === 0 ? (
                  <p className="text-center text-gray-500 py-4 text-xs sm:text-sm">
                    Você não possui empréstimos ativos.
                  </p>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {meusEmprestimos.map((emprestimo) => {
                      const item = itens.find((i) => i.id === emprestimo.itemId)

                      return (
                        <Card key={emprestimo.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <h4 className="font-medium text-xs sm:text-sm leading-tight break-words">
                                  {item?.titulo || "Livro não encontrado"}
                                </h4>
                                {getStatusBadge(emprestimo)}
                              </div>

                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span>Empréstimo: {formatarData(emprestimo.dataEmprestimo)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span>Devolução: {formatarData(emprestimo.dataDevolucaoPrevista)}</span>
                                </div>
                              </div>

                              {item && (
                                <div className="text-xs text-gray-500 break-words">
                                  <span>Autor: {item.autor}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas do Usuário */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm sm:text-base">Suas Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Empréstimos Ativos:</span>
                    <span className="font-medium">{meusEmprestimos.filter((e) => e.status === "ativo").length}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Total de Empréstimos:</span>
                    <span className="font-medium">{meusEmprestimos.length}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Livros Devolvidos:</span>
                    <span className="font-medium">
                      {meusEmprestimos.filter((e) => e.status === "devolvido").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
