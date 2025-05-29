import { prisma } from "@/lib/prisma"
import type {
  CriarItemData,
  AtualizarItemData,
  FiltroItem,
  ResultadoItem,
  ResultadoItens,
  ResultadoOperacao,
} from "@/lib/types"

export class AcervoService {
  async adicionarItem(dados: CriarItemData): Promise<ResultadoItem> {
    try {
      // Verificar se código já existe
      const itemExistente = await prisma.itemAcervo.findUnique({
        where: { codigo: dados.codigo },
      })

      if (itemExistente) {
        return { sucesso: false, erro: "Código já existe no sistema" }
      }

      // Verificar se ISBN já existe (se fornecido)
      if (dados.isbn) {
        const itemComIsbn = await prisma.itemAcervo.findFirst({
          where: { isbn: dados.isbn },
        })

        if (itemComIsbn) {
          return { sucesso: false, erro: "ISBN já cadastrado no sistema" }
        }
      }

      // Criar item
      const item = await prisma.itemAcervo.create({
        data: {
          ...dados,
          quantidadeDisponivel: dados.quantidadeTotal,
        },
      })

      return { sucesso: true, item }
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
      return { sucesso: false, erro: "Erro interno do servidor" }
    }
  }

  async consultarItens(filtro?: FiltroItem): Promise<ResultadoItens> {
    try {
      const where: any = {}

      if (filtro?.titulo) {
        where.titulo = {
          contains: filtro.titulo,
          mode: "insensitive",
        }
      }

      if (filtro?.autor) {
        where.autor = {
          contains: filtro.autor,
          mode: "insensitive",
        }
      }

      if (filtro?.categoria) {
        where.categoria = {
          contains: filtro.categoria,
          mode: "insensitive",
        }
      }

      if (filtro?.codigo) {
        where.codigo = filtro.codigo
      }

      if (filtro?.isbn) {
        where.isbn = filtro.isbn
      }

      if (filtro?.disponivel !== undefined) {
        if (filtro.disponivel) {
          where.quantidadeDisponivel = { gt: 0 }
        } else {
          where.quantidadeDisponivel = { lte: 0 }
        }
      }

      const itens = await prisma.itemAcervo.findMany({
        where,
        include: {
          emprestimos: {
            where: { status: "ATIVO" },
            include: { usuario: true },
          },
        },
        orderBy: { criadoEm: "desc" },
      })

      return { sucesso: true, itens }
    } catch (error) {
      console.error("Erro ao consultar itens:", error)
      return { sucesso: false, erro: "Erro ao consultar itens" }
    }
  }

  async buscarItemPorId(id: string): Promise<ResultadoItem> {
    try {
      const item = await prisma.itemAcervo.findUnique({
        where: { id },
        include: {
          emprestimos: {
            include: { usuario: true },
            orderBy: { criadoEm: "desc" },
          },
        },
      })

      if (!item) {
        return { sucesso: false, erro: "Item não encontrado" }
      }

      return { sucesso: true, item }
    } catch (error) {
      console.error("Erro ao buscar item:", error)
      return { sucesso: false, erro: "Erro ao buscar item" }
    }
  }

  async atualizarItem(id: string, dados: AtualizarItemData): Promise<ResultadoItem> {
    try {
      const itemAtual = await prisma.itemAcervo.findUnique({
        where: { id },
      })

      if (!itemAtual) {
        return { sucesso: false, erro: "Item não encontrado" }
      }

      // Se está alterando a quantidade total, verificar se não é menor que a emprestada
      if (dados.quantidadeTotal !== undefined && dados.quantidadeTotal < itemAtual.quantidadeEmprestada) {
        return {
          sucesso: false,
          erro: `Não é possível reduzir para ${dados.quantidadeTotal}. Há ${itemAtual.quantidadeEmprestada} exemplares emprestados.`,
        }
      }

      // Calcular nova quantidade disponível se a total foi alterada
      const dadosAtualizacao: any = { ...dados }
      if (dados.quantidadeTotal !== undefined) {
        dadosAtualizacao.quantidadeDisponivel = dados.quantidadeTotal - itemAtual.quantidadeEmprestada
      }

      const item = await prisma.itemAcervo.update({
        where: { id },
        data: dadosAtualizacao,
      })

      return { sucesso: true, item }
    } catch (error) {
      console.error("Erro ao atualizar item:", error)
      return { sucesso: false, erro: "Erro ao atualizar item" }
    }
  }

  async removerItem(id: string): Promise<ResultadoOperacao> {
    try {
      const item = await prisma.itemAcervo.findUnique({
        where: { id },
        include: {
          emprestimos: {
            where: { status: "ATIVO" },
          },
        },
      })

      if (!item) {
        return { sucesso: false, erro: "Item não encontrado" }
      }

      if (item.emprestimos.length > 0) {
        return { sucesso: false, erro: "Não é possível remover item com empréstimos ativos" }
      }

      await prisma.itemAcervo.delete({
        where: { id },
      })

      return { sucesso: true }
    } catch (error) {
      console.error("Erro ao remover item:", error)
      return { sucesso: false, erro: "Erro ao remover item" }
    }
  }

  async obterEstatisticas(): Promise<{
    sucesso: boolean
    estatisticas?: {
      totalItens: number
      totalExemplares: number
      exemplaresDisponiveis: number
      exemplaresEmprestados: number
      itensSemEstoque: number
      categorias: { categoria: string; quantidade: number }[]
    }
    erro?: string
  }> {
    try {
      const [itens, categorias] = await Promise.all([
        prisma.itemAcervo.findMany(),
        prisma.itemAcervo.groupBy({
          by: ["categoria"],
          _count: { categoria: true },
          orderBy: { _count: { categoria: "desc" } },
        }),
      ])

      const estatisticas = {
        totalItens: itens.length,
        totalExemplares: itens.reduce((total, item) => total + item.quantidadeTotal, 0),
        exemplaresDisponiveis: itens.reduce((total, item) => total + item.quantidadeDisponivel, 0),
        exemplaresEmprestados: itens.reduce((total, item) => total + item.quantidadeEmprestada, 0),
        itensSemEstoque: itens.filter((item) => item.quantidadeDisponivel === 0).length,
        categorias: categorias.map((cat) => ({
          categoria: cat.categoria,
          quantidade: cat._count.categoria,
        })),
      }

      return { sucesso: true, estatisticas }
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error)
      return { sucesso: false, erro: "Erro ao obter estatísticas" }
    }
  }
}

export const acervoService = new AcervoService()
