import { prisma } from "@/lib/prisma"
import { calcularDataDevolucao } from "@/lib/validations"
import type { FiltroEmprestimo, ResultadoEmprestimo, ResultadoEmprestimos, ResultadoOperacao } from "@/lib/types"

export class EmprestimoService {
  async registrarEmprestimo(dados: {
    usuarioId: string
    itemId: string
    bibliotecario: string
  }): Promise<ResultadoEmprestimo> {
    try {
      // Verificar se usuário existe e está ativo
      const usuario = await prisma.usuario.findUnique({
        where: { id: dados.usuarioId },
      })

      if (!usuario) {
        return { sucesso: false, erro: "Usuário não encontrado" }
      }

      if (!usuario.ativo) {
        return { sucesso: false, erro: "Usuário inativo" }
      }

      // Verificar se item existe e tem quantidade disponível
      const item = await prisma.itemAcervo.findUnique({
        where: { id: dados.itemId },
      })

      if (!item) {
        return { sucesso: false, erro: "Item não encontrado" }
      }

      if (item.quantidadeDisponivel <= 0) {
        return { sucesso: false, erro: "Item não disponível para empréstimo" }
      }

      // Verificar limite de empréstimos
      const emprestimosAtivos = await prisma.emprestimo.count({
        where: {
          usuarioId: dados.usuarioId,
          status: "ATIVO",
        },
      })

      const limites = {
        ESTUDANTE: 3,
        PROFESSOR: 5,
        VISITANTE: 1,
      }
      const limite = limites[usuario.categoria]

      if (emprestimosAtivos >= limite) {
        return { sucesso: false, erro: `Limite de ${limite} empréstimos atingido` }
      }

      // Calcular data de devolução
      const dataEmprestimo = new Date()
      const categoriaLower = usuario.categoria.toLowerCase() as "estudante" | "professor" | "visitante"
      const dataDevolucao = calcularDataDevolucao(categoriaLower, dataEmprestimo)

      // Criar empréstimo e atualizar item em uma transação
      const emprestimo = await prisma.$transaction(async (tx) => {
        // Criar empréstimo
        const novoEmprestimo = await tx.emprestimo.create({
          data: {
            usuarioId: dados.usuarioId,
            itemId: dados.itemId,
            dataDevolucaoPrevista: dataDevolucao,
            bibliotecario: dados.bibliotecario,
            status: "ATIVO",
          },
          include: {
            usuario: true,
            item: true,
          },
        })

        // Atualizar quantidades do item
        await tx.itemAcervo.update({
          where: { id: dados.itemId },
          data: {
            quantidadeDisponivel: { decrement: 1 },
            quantidadeEmprestada: { increment: 1 },
          },
        })

        return novoEmprestimo
      })

      return { sucesso: true, emprestimo }
    } catch (error) {
      console.error("Erro ao registrar empréstimo:", error)
      return { sucesso: false, erro: "Erro interno do servidor" }
    }
  }

  async consultarEmprestimos(filtro?: FiltroEmprestimo): Promise<ResultadoEmprestimos> {
    try {
      const where: any = {}

      if (filtro?.usuarioId) {
        where.usuarioId = filtro.usuarioId
      }

      if (filtro?.itemId) {
        where.itemId = filtro.itemId
      }

      if (filtro?.status) {
        where.status = filtro.status
      }

      if (filtro?.dataInicio || filtro?.dataFim) {
        where.dataEmprestimo = {}
        if (filtro.dataInicio) {
          where.dataEmprestimo.gte = filtro.dataInicio
        }
        if (filtro.dataFim) {
          where.dataEmprestimo.lte = filtro.dataFim
        }
      }

      const emprestimos = await prisma.emprestimo.findMany({
        where,
        include: {
          usuario: true,
          item: true,
        },
        orderBy: { criadoEm: "desc" },
      })

      return { sucesso: true, emprestimos }
    } catch (error) {
      console.error("Erro ao consultar empréstimos:", error)
      return { sucesso: false, erro: "Erro ao consultar empréstimos" }
    }
  }

  async devolverEmprestimo(emprestimoId: string, bibliotecario: string): Promise<ResultadoOperacao> {
    try {
      const emprestimo = await prisma.emprestimo.findUnique({
        where: { id: emprestimoId },
        include: { item: true },
      })

      if (!emprestimo) {
        return { sucesso: false, erro: "Empréstimo não encontrado" }
      }

      if (emprestimo.status !== "ATIVO") {
        return { sucesso: false, erro: "Empréstimo já foi devolvido" }
      }

      // Devolver empréstimo e atualizar item em uma transação
      await prisma.$transaction(async (tx) => {
        // Atualizar empréstimo
        await tx.emprestimo.update({
          where: { id: emprestimoId },
          data: {
            status: "DEVOLVIDO",
            dataDevolucaoReal: new Date(),
            bibliotecario: `${emprestimo.bibliotecario} / Devolução: ${bibliotecario}`,
          },
        })

        // Atualizar quantidades do item
        await tx.itemAcervo.update({
          where: { id: emprestimo.itemId },
          data: {
            quantidadeDisponivel: { increment: 1 },
            quantidadeEmprestada: { decrement: 1 },
          },
        })
      })

      return { sucesso: true }
    } catch (error) {
      console.error("Erro ao devolver empréstimo:", error)
      return { sucesso: false, erro: "Erro interno do servidor" }
    }
  }

  async marcarComoAtrasado(): Promise<ResultadoOperacao> {
    try {
      const agora = new Date()

      await prisma.emprestimo.updateMany({
        where: {
          status: "ATIVO",
          dataDevolucaoPrevista: {
            lt: agora,
          },
        },
        data: {
          status: "ATRASADO",
        },
      })

      return { sucesso: true }
    } catch (error) {
      console.error("Erro ao marcar empréstimos como atrasados:", error)
      return { sucesso: false, erro: "Erro ao atualizar status dos empréstimos" }
    }
  }

  async obterEstatisticas(): Promise<{
    sucesso: boolean
    estatisticas?: {
      totalEmprestimos: number
      emprestimosAtivos: number
      emprestimosAtrasados: number
      emprestimosDevolvidos: number
    }
    erro?: string
  }> {
    try {
      const [total, ativos, atrasados, devolvidos] = await Promise.all([
        prisma.emprestimo.count(),
        prisma.emprestimo.count({ where: { status: "ATIVO" } }),
        prisma.emprestimo.count({ where: { status: "ATRASADO" } }),
        prisma.emprestimo.count({ where: { status: "DEVOLVIDO" } }),
      ])

      return {
        sucesso: true,
        estatisticas: {
          totalEmprestimos: total,
          emprestimosAtivos: ativos,
          emprestimosAtrasados: atrasados,
          emprestimosDevolvidos: devolvidos,
        },
      }
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error)
      return { sucesso: false, erro: "Erro ao obter estatísticas" }
    }
  }
}

export const emprestimoService = new EmprestimoService()
