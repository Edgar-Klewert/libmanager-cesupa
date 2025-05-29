import { describe, it, expect, beforeEach } from "vitest"
import { EmprestimoService } from "@/lib/services/emprestimo-service"
import { UsuarioService } from "@/lib/services/usuario-service"
import { db } from "@/lib/database"

describe("EmprestimoService", () => {
  let emprestimoService: EmprestimoService
  let usuarioService: UsuarioService

  beforeEach(() => {
    emprestimoService = new EmprestimoService()
    usuarioService = new UsuarioService()
  })

  describe("registrarEmprestimo", () => {
    it("deve registrar empréstimo válido", async () => {
      // Cadastrar usuário
      const usuario = await usuarioService.cadastrarUsuario({
        nome: "Teste Empréstimo",
        dataNascimento: "1990-01-01",
        cpf: "123.123.123-12",
        telefone: "(11) 99999-9999",
        endereco: "Rua Teste, 123",
        categoria: "estudante",
      })

      if (!usuario.usuario) throw new Error("Usuário não cadastrado")

      // Buscar item disponível
      const itens = await db.buscarItens()
      const itemDisponivel = itens.find((item) => item.disponivel)

      if (!itemDisponivel) throw new Error("Nenhum item disponível")

      // Registrar empréstimo
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId: usuario.usuario.id,
        itemId: itemDisponivel.id,
        bibliotecario: "Teste",
      })

      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimo).toBeDefined()
      expect(resultado.emprestimo?.status).toBe("ativo")
    })

    it("deve rejeitar empréstimo para usuário inativo", async () => {
      // Cadastrar e inativar usuário
      const usuario = await usuarioService.cadastrarUsuario({
        nome: "Usuário Inativo",
        dataNascimento: "1990-01-01",
        cpf: "321.321.321-21",
        telefone: "(11) 99999-9999",
        endereco: "Rua Teste, 456",
        categoria: "estudante",
      })

      if (!usuario.usuario) throw new Error("Usuário não cadastrado")

      await usuarioService.inativarUsuario(usuario.usuario.id, "Teste", "Admin")

      // Buscar item disponível
      const itens = await db.buscarItens()
      const itemDisponivel = itens.find((item) => item.disponivel)

      if (!itemDisponivel) throw new Error("Nenhum item disponível")

      // Tentar registrar empréstimo
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId: usuario.usuario.id,
        itemId: itemDisponivel.id,
        bibliotecario: "Teste",
      })

      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário inativo")
    })

    it("deve rejeitar empréstimo para item indisponível", async () => {
      // Cadastrar usuário
      const usuario = await usuarioService.cadastrarUsuario({
        nome: "Teste Item Indisponível",
        dataNascimento: "1990-01-01",
        cpf: "456.456.456-45",
        telefone: "(11) 99999-9999",
        endereco: "Rua Teste, 789",
        categoria: "estudante",
      })

      if (!usuario.usuario) throw new Error("Usuário não cadastrado")

      // Buscar item indisponível (criar um empréstimo primeiro)
      const itens = await db.buscarItens()
      const item = itens[0]

      // Marcar item como indisponível
      item.disponivel = false

      // Tentar registrar empréstimo
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId: usuario.usuario.id,
        itemId: item.id,
        bibliotecario: "Teste",
      })

      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Item não disponível para empréstimo")
    })
  })

  describe("consultarEmprestimos", () => {
    it("deve retornar todos os empréstimos", async () => {
      const resultado = await emprestimoService.consultarEmprestimos()

      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimos).toBeDefined()
      expect(Array.isArray(resultado.emprestimos)).toBe(true)
    })

    it("deve filtrar empréstimos por usuário", async () => {
      // Cadastrar usuário e fazer empréstimo
      const usuario = await usuarioService.cadastrarUsuario({
        nome: "Filtro Empréstimo",
        dataNascimento: "1990-01-01",
        cpf: "789.789.789-78",
        telefone: "(11) 99999-9999",
        endereco: "Rua Filtro, 123",
        categoria: "professor",
      })

      if (!usuario.usuario) throw new Error("Usuário não cadastrado")

      const itens = await db.buscarItens()
      const itemDisponivel = itens.find((item) => item.disponivel)

      if (itemDisponivel) {
        await emprestimoService.registrarEmprestimo({
          usuarioId: usuario.usuario.id,
          itemId: itemDisponivel.id,
          bibliotecario: "Teste",
        })
      }

      // Consultar empréstimos do usuário
      const resultado = await emprestimoService.consultarEmprestimos({
        usuarioId: usuario.usuario.id,
      })

      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimos?.length).toBeGreaterThan(0)
      expect(resultado.emprestimos?.[0].usuarioId).toBe(usuario.usuario.id)
    })
  })
})
