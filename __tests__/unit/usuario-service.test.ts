import { describe, it, expect, beforeEach, vi } from "vitest"
import { UsuarioService } from "@/lib/services/usuario-service"

// Mock do banco de dados
const mockDb = {
  criarUsuario: vi.fn(),
  buscarUsuarioPorCpf: vi.fn(),
  buscarUsuarios: vi.fn(),
  buscarUsuarioPorId: vi.fn(),
  atualizarUsuario: vi.fn(),
  inativarUsuario: vi.fn(),
}

// Mock das validações
vi.mock("@/lib/validations", () => ({
  validarCPF: vi.fn(),
  validarEmail: vi.fn(),
}))

vi.mock("@/lib/database", () => ({
  db: mockDb,
}))

describe("UsuarioService - Testes Unitários", () => {
  let usuarioService: UsuarioService
  let validarCPF: any
  let validarEmail: any

  beforeEach(async () => {
    usuarioService = new UsuarioService()
    const validations = await import("@/lib/validations")
    validarCPF = validations.validarCPF
    validarEmail = validations.validarEmail
    vi.clearAllMocks()
  })

  describe("cadastrarUsuario", () => {
    const dadosUsuarioValido = {
      nome: "João Silva",
      dataNascimento: "1990-01-01",
      cpf: "123.456.789-09",
      telefone: "(11) 99999-9999",
      endereco: "Rua A, 123",
      categoria: "estudante" as const,
      email: "joao@teste.com",
    }

    it("deve cadastrar usuário com dados válidos", async () => {
      // Arrange
      vi.mocked(validarCPF).mockReturnValue(true)
      vi.mocked(validarEmail).mockReturnValue(true)
      mockDb.buscarUsuarioPorCpf.mockResolvedValue(null)
      mockDb.criarUsuario.mockResolvedValue({
        id: "1",
        ...dadosUsuarioValido,
        ativo: true,
        criadoEm: "2024-01-01",
        atualizadoEm: "2024-01-01",
        historico: [],
      })

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosUsuarioValido)

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuario).toBeDefined()
      expect(validarCPF).toHaveBeenCalledWith(dadosUsuarioValido.cpf)
      expect(validarEmail).toHaveBeenCalledWith(dadosUsuarioValido.email)
      expect(mockDb.buscarUsuarioPorCpf).toHaveBeenCalledWith(dadosUsuarioValido.cpf)
      expect(mockDb.criarUsuario).toHaveBeenCalledWith({
        ...dadosUsuarioValido,
        ativo: true,
      })
    })

    it("deve rejeitar CPF inválido", async () => {
      // Arrange
      vi.mocked(validarCPF).mockReturnValue(false)

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosUsuarioValido)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("CPF inválido")
      expect(mockDb.buscarUsuarioPorCpf).not.toHaveBeenCalled()
      expect(mockDb.criarUsuario).not.toHaveBeenCalled()
    })

    it("deve rejeitar email inválido", async () => {
      // Arrange
      vi.mocked(validarCPF).mockReturnValue(true)
      vi.mocked(validarEmail).mockReturnValue(false)

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosUsuarioValido)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Email inválido")
      expect(mockDb.criarUsuario).not.toHaveBeenCalled()
    })

    it("deve rejeitar CPF duplicado", async () => {
      // Arrange
      vi.mocked(validarCPF).mockReturnValue(true)
      vi.mocked(validarEmail).mockReturnValue(true)
      mockDb.buscarUsuarioPorCpf.mockResolvedValue({ id: "1", cpf: dadosUsuarioValido.cpf })

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosUsuarioValido)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("CPF já cadastrado no sistema")
      expect(mockDb.criarUsuario).not.toHaveBeenCalled()
    })

    it("deve lidar com erro interno do servidor", async () => {
      // Arrange
      vi.mocked(validarCPF).mockReturnValue(true)
      vi.mocked(validarEmail).mockReturnValue(true)
      mockDb.buscarUsuarioPorCpf.mockRejectedValue(new Error("Erro de conexão"))

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosUsuarioValido)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Erro interno do servidor")
    })

    it("deve cadastrar usuário sem email", async () => {
      // Arrange
      const dadosSemEmail = { ...dadosUsuarioValido }
      delete dadosSemEmail.email

      vi.mocked(validarCPF).mockReturnValue(true)
      mockDb.buscarUsuarioPorCpf.mockResolvedValue(null)
      mockDb.criarUsuario.mockResolvedValue({
        id: "1",
        ...dadosSemEmail,
        ativo: true,
        criadoEm: "2024-01-01",
        atualizadoEm: "2024-01-01",
        historico: [],
      })

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosSemEmail)

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(validarEmail).not.toHaveBeenCalled()
    })
  })

  describe("consultarUsuarios", () => {
    it("deve retornar todos os usuários quando não há filtro", async () => {
      // Arrange
      const usuariosMock = [
        { id: "1", nome: "João", cpf: "123.456.789-09" },
        { id: "2", nome: "Maria", cpf: "987.654.321-00" },
      ]
      mockDb.buscarUsuarios.mockResolvedValue(usuariosMock)

      // Act
      const resultado = await usuarioService.consultarUsuarios()

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toEqual(usuariosMock)
      expect(mockDb.buscarUsuarios).toHaveBeenCalledWith(undefined)
    })

    it("deve aplicar filtros corretamente", async () => {
      // Arrange
      const filtro = { nome: "João" }
      const usuariosFiltrados = [{ id: "1", nome: "João", cpf: "123.456.789-09" }]
      mockDb.buscarUsuarios.mockResolvedValue(usuariosFiltrados)

      // Act
      const resultado = await usuarioService.consultarUsuarios(filtro)

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toEqual(usuariosFiltrados)
      expect(mockDb.buscarUsuarios).toHaveBeenCalledWith(filtro)
    })

    it("deve lidar com erro na consulta", async () => {
      // Arrange
      mockDb.buscarUsuarios.mockRejectedValue(new Error("Erro de consulta"))

      // Act
      const resultado = await usuarioService.consultarUsuarios()

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Erro ao consultar usuários")
    })
  })

  describe("atualizarUsuario", () => {
    it("deve atualizar usuário com dados válidos", async () => {
      // Arrange
      const usuarioAtualizado = { id: "1", nome: "João Atualizado", telefone: "novo-telefone" }
      vi.mocked(validarEmail).mockReturnValue(true)
      mockDb.atualizarUsuario.mockResolvedValue(usuarioAtualizado)

      // Act
      const resultado = await usuarioService.atualizarUsuario("1", { telefone: "novo-telefone" }, "Admin")

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuario).toEqual(usuarioAtualizado)
      expect(mockDb.atualizarUsuario).toHaveBeenCalledWith("1", { telefone: "novo-telefone" }, "Admin")
    })

    it("deve rejeitar email inválido na atualização", async () => {
      // Arrange
      vi.mocked(validarEmail).mockReturnValue(false)

      // Act
      const resultado = await usuarioService.atualizarUsuario("1", { email: "email-invalido" }, "Admin")

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Email inválido")
      expect(mockDb.atualizarUsuario).not.toHaveBeenCalled()
    })

    it("deve retornar erro para usuário não encontrado", async () => {
      // Arrange
      mockDb.atualizarUsuario.mockResolvedValue(null)

      // Act
      const resultado = await usuarioService.atualizarUsuario("999", { telefone: "novo" }, "Admin")

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário não encontrado")
    })
  })

  describe("inativarUsuario", () => {
    it("deve inativar usuário com sucesso", async () => {
      // Arrange
      mockDb.inativarUsuario.mockResolvedValue(true)

      // Act
      const resultado = await usuarioService.inativarUsuario("1", "Motivo teste", "Admin")

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(mockDb.inativarUsuario).toHaveBeenCalledWith("1", "Motivo teste", "Admin")
    })

    it("deve lidar com erro de usuário com empréstimos ativos", async () => {
      // Arrange
      mockDb.inativarUsuario.mockRejectedValue(new Error("Usuário possui empréstimos ativos"))

      // Act
      const resultado = await usuarioService.inativarUsuario("1", "Motivo", "Admin")

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário possui empréstimos ativos")
    })
  })
})
