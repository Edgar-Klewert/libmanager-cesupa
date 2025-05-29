import { prisma } from "@/lib/prisma"
import { validarCPF, validarEmail } from "@/lib/validations"
import type {
  Usuario,
  CategoriaUsuario,
  CriarUsuarioData,
  AtualizarUsuarioData,
  FiltroUsuario,
  ResultadoUsuario,
  ResultadoUsuarios,
  ResultadoOperacao,
} from "@/lib/types"

export class UsuarioService {
  async cadastrarUsuario(dados: CriarUsuarioData): Promise<ResultadoUsuario> {
    try {
      // Validações
      if (!validarCPF(dados.cpf)) {
        return { sucesso: false, erro: "CPF inválido" }
      }

      if (dados.email && !validarEmail(dados.email)) {
        return { sucesso: false, erro: "Email inválido" }
      }

      // Verificar se CPF já existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { cpf: dados.cpf },
      })

      if (usuarioExistente) {
        return { sucesso: false, erro: "CPF já cadastrado no sistema" }
      }

      // Criar usuário
      const usuario = await prisma.usuario.create({
        data: {
          ...dados,
          categoria: dados.categoria.toUpperCase() as CategoriaUsuario,
        },
      })

      return { sucesso: true, usuario }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error)
      return { sucesso: false, erro: "Erro interno do servidor" }
    }
  }

  async consultarUsuarios(filtro?: FiltroUsuario): Promise<ResultadoUsuarios> {
    try {
      const where: any = {}

      if (filtro?.nome) {
        where.nome = {
          contains: filtro.nome,
          mode: "insensitive",
        }
      }

      if (filtro?.cpf) {
        where.cpf = filtro.cpf
      }

      if (filtro?.categoria) {
        where.categoria = filtro.categoria
      }

      if (filtro?.ativo !== undefined) {
        where.ativo = filtro.ativo
      }

      if (filtro?.matricula) {
        where.matricula = filtro.matricula
      }

      const usuarios = await prisma.usuario.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        include: {
          emprestimos: {
            where: { status: "ATIVO" },
            include: { item: true },
          },
        },
      })

      return { sucesso: true, usuarios }
    } catch (error) {
      console.error("Erro ao consultar usuários:", error)
      return { sucesso: false, erro: "Erro ao consultar usuários" }
    }
  }

  async buscarUsuarioPorId(id: string): Promise<ResultadoUsuario> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id },
        include: {
          emprestimos: {
            include: { item: true },
          },
          historico: {
            orderBy: { alteradoEm: "desc" },
          },
        },
      })

      if (!usuario) {
        return { sucesso: false, erro: "Usuário não encontrado" }
      }

      return { sucesso: true, usuario }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return { sucesso: false, erro: "Erro ao buscar usuário" }
    }
  }

  async buscarUsuarioPorCpf(cpf: string): Promise<ResultadoUsuario> {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { cpf },
        include: {
          emprestimos: {
            where: { status: "ATIVO" },
            include: { item: true },
          },
        },
      })

      if (!usuario) {
        return { sucesso: false, erro: "Usuário não encontrado" }
      }

      return { sucesso: true, usuario }
    } catch (error) {
      console.error("Erro ao buscar usuário por CPF:", error)
      return { sucesso: false, erro: "Erro ao buscar usuário" }
    }
  }

  async atualizarUsuario(id: string, dados: AtualizarUsuarioData, alteradoPor: string): Promise<ResultadoUsuario> {
    try {
      // Validações
      if (dados.email && !validarEmail(dados.email)) {
        return { sucesso: false, erro: "Email inválido" }
      }

      // Buscar usuário atual para histórico
      const usuarioAtual = await prisma.usuario.findUnique({
        where: { id },
      })

      if (!usuarioAtual) {
        return { sucesso: false, erro: "Usuário não encontrado" }
      }

      // Preparar dados para atualização
      const dadosAtualizacao: any = { ...dados }
      if (dados.categoria) {
        dadosAtualizacao.categoria = dados.categoria.toString().toUpperCase() as CategoriaUsuario
      }

      // Atualizar usuário e criar histórico em uma transação
      const usuario = await prisma.$transaction(async (tx) => {
        // Criar registros de histórico para campos alterados
        const historicoPromises = Object.entries(dados)
          .filter(([campo, valorNovo]) => {
            const valorAtual = usuarioAtual[campo as keyof Usuario]
            return valorAtual !== valorNovo
          })
          .map(([campo, valorNovo]) =>
            tx.historicoAlteracao.create({
              data: {
                usuarioId: id,
                campo,
                valorAnterior: String(usuarioAtual[campo as keyof Usuario] || ""),
                valorNovo: String(valorNovo || ""),
                alteradoPor,
              },
            }),
          )

        await Promise.all(historicoPromises)

        // Atualizar usuário
        return tx.usuario.update({
          where: { id },
          data: dadosAtualizacao,
          include: {
            historico: {
              orderBy: { alteradoEm: "desc" },
              take: 10,
            },
          },
        })
      })

      return { sucesso: true, usuario }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      return { sucesso: false, erro: "Erro ao atualizar usuário" }
    }
  }

  async inativarUsuario(id: string, motivo: string, inativadoPor: string): Promise<ResultadoOperacao> {
    try {
      // Verificar se há empréstimos ativos
      const emprestimosAtivos = await prisma.emprestimo.count({
        where: {
          usuarioId: id,
          status: "ATIVO",
        },
      })

      if (emprestimosAtivos > 0) {
        return { sucesso: false, erro: "Usuário possui empréstimos ativos" }
      }

      // Inativar usuário e registrar no histórico
      await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
          where: { id },
          data: { ativo: false },
        })

        await tx.historicoAlteracao.create({
          data: {
            usuarioId: id,
            campo: "ativo",
            valorAnterior: "true",
            valorNovo: "false",
            alteradoPor: `${inativadoPor} - Motivo: ${motivo}`,
          },
        })
      })

      return { sucesso: true }
    } catch (error) {
      console.error("Erro ao inativar usuário:", error)
      return { sucesso: false, erro: "Erro ao inativar usuário" }
    }
  }

  async contarEmprestimosAtivos(usuarioId: string): Promise<number> {
    try {
      return await prisma.emprestimo.count({
        where: {
          usuarioId,
          status: "ATIVO",
        },
      })
    } catch (error) {
      console.error("Erro ao contar empréstimos ativos:", error)
      return 0
    }
  }
}

export const usuarioService = new UsuarioService()
