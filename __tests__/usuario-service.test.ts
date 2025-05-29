import { describe, it, expect, beforeEach } from "vitest"
import { UsuarioService } from "@/lib/services/usuario-service"

describe("UsuarioService", () => {
  let usuarioService: UsuarioService

  beforeEach(() => {
    usuarioService = new UsuarioService()
  })

  describe("cadastrarUsuario", () => {
    it("deve cadastrar um usuário válido", async () => {
      const dadosUsuario = {
        nome: "João Silva",
        dataNascimento: "1990-01-01",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        endereco: "Rua A, 123",
        categoria: "estudante" as const,
        email: "joao@teste.com",
      }

      const resultado = await usuarioService.cadastrarUsuario(dadosUsuario)

      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuario).toBeDefined()
      expect(resultado.usuario?.nome).toBe(dadosUsuario.nome)
      expect(resultado.usuario?.ativo).toBe(true)
    })

    it("deve rejeitar CPF inválido", async () => {
      const dadosUsuario = {
        nome: "João Silva",
        dataNascimento: "1990-01-01",
        cpf: "123.456.789-00", // CPF inválido
        telefone: "(11) 99999-9999",
        endereco: "Rua A, 123",
        categoria: "estudante" as const,
      }

      const resultado = await usuarioService.cadastrarUsuario(dadosUsuario)

      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("CPF inválido")
    })

    it("deve rejeitar email inválido", async () => {
      const dadosUsuario = {
        nome: "João Silva",
        dataNascimento: "1990-01-01",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        endereco: "Rua A, 123",
        categoria: "estudante" as const,
        email: "email-invalido",
      }

      const resultado = await usuarioService.cadastrarUsuario(dadosUsuario)

      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Email inválido")
    })

    it("deve rejeitar CPF duplicado", async () => {
      const dadosUsuario = {
        nome: "João Silva",
        dataNascimento: "1990-01-01",
        cpf: "123.456.789-09",
        telefone: "(11) 99999-9999",
        endereco: "Rua A, 123",
        categoria: "estudante" as const,
      }

      // Primeiro cadastro
      await usuarioService.cadastrarUsuario(dadosUsuario)

      // Segundo cadastro com mesmo CPF
      const resultado = await usuarioService.cadastrarUsuario({
        ...dadosUsuario,
        nome: "Maria Silva",
      })

      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("CPF já cadastrado no sistema")
    })
  })

  describe("consultarUsuarios", () => {
    it("deve retornar todos os usuários quando não há filtro", async () => {
      const resultado = await usuarioService.consultarUsuarios()

      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toBeDefined()
      expect(Array.isArray(resultado.usuarios)).toBe(true)
    })

    it("deve filtrar usuários por nome", async () => {
      // Cadastrar usuário de teste
      await usuarioService.cadastrarUsuario({
        nome: "Maria Santos",
        dataNascimento: "1990-01-01",
        cpf: "987.654.321-00",
        telefone: "(11) 99999-9999",
        endereco: "Rua B, 456",
        categoria: "professor",
      })

      const resultado = await usuarioService.consultarUsuarios({ nome: "Maria" })

      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios?.length).toBeGreaterThan(0)
      expect(resultado.usuarios?.[0].nome).toContain("Maria")
    })
  })

  describe("atualizarUsuario", () => {
    it("deve atualizar dados do usuário", async () => {
      // Cadastrar usuário
      const cadastro = await usuarioService.cadastrarUsuario({
        nome: "Pedro Silva",
        dataNascimento: "1990-01-01",
        cpf: "111.222.333-44",
        telefone: "(11) 99999-9999",
        endereco: "Rua C, 789",
        categoria: "estudante",
      })

      if (!cadastro.usuario) throw new Error("Usuário não cadastrado")

      // Atualizar dados
      const resultado = await usuarioService.atualizarUsuario(
        cadastro.usuario.id,
        { telefone: "(11) 88888-8888" },
        "Admin",
      )

      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuario?.telefone).toBe("(11) 88888-8888")
    })

    it("deve rejeitar atualização com email inválido", async () => {
      // Cadastrar usuário
      const cadastro = await usuarioService.cadastrarUsuario({
        nome: "Ana Silva",
        dataNascimento: "1990-01-01",
        cpf: "555.666.777-88",
        telefone: "(11) 99999-9999",
        endereco: "Rua D, 101",
        categoria: "estudante",
      })

      if (!cadastro.usuario) throw new Error("Usuário não cadastrado")

      // Tentar atualizar com email inválido
      const resultado = await usuarioService.atualizarUsuario(cadastro.usuario.id, { email: "email-invalido" }, "Admin")

      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Email inválido")
    })
  })

  describe("inativarUsuario", () => {
    it("deve inativar usuário sem empréstimos", async () => {
      // Cadastrar usuário
      const cadastro = await usuarioService.cadastrarUsuario({
        nome: "Carlos Silva",
        dataNascimento: "1990-01-01",
        cpf: "999.888.777-66",
        telefone: "(11) 99999-9999",
        endereco: "Rua E, 202",
        categoria: "visitante",
      })

      if (!cadastro.usuario) throw new Error("Usuário não cadastrado")

      // Inativar usuário
      const resultado = await usuarioService.inativarUsuario(cadastro.usuario.id, "Teste de inativação", "Admin")

      expect(resultado.sucesso).toBe(true)
    })
  })
})
