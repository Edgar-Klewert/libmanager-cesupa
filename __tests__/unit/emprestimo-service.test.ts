import { describe, it, expect, beforeEach, vi } from "vitest"
import { EmprestimoService } from "@/lib/services/emprestimo-service"

// Mock do banco de dados
const mockDb = {
  buscarUsuarioPorId: vi.fn(),
  buscarItemPorId: vi.fn(),
  contarEmprestimosAtivos: vi.fn(),
  criarEmprestimo: vi.fn(),
  buscarEmprestimos: vi.fn(),
}

// Mock das validações
vi.mock("@/lib/validations", () => ({
  calcularDataDevolucao: vi.fn(),
}))

vi.mock("@/lib/database", () => ({
  db: mockDb,
}))

describe("EmprestimoService - Testes Unitários", () => {
  let emprestimoService: EmprestimoService
  let calcularDataDevolucao: any

  beforeEach(async () => {
    emprestimoService = new EmprestimoService()
    vi.clearAllMocks()
    const { calcularDataDevolucao: calc } = await import("@/lib/validations")
    calcularDataDevolucao = calc
  })

  describe("registrarEmprestimo", () => {
    const dadosEmprestimo = {
      usuarioId: "user-1",
      itemId: "item-1",
      bibliotecario: "Bibliotecário Teste",
    }

    const usuarioMock = {
      id: "user-1",
      nome: "João Silva",
      categoria: "estudante",
      ativo: true,
    }

    const itemMock = {
      id: "item-1",
      titulo: "Clean Code",
      disponivel: true,
    }

    it("deve registrar empréstimo com dados válidos", async () => {
      // Arrange
      const dataEmprestimo = new Date()
      const dataDevolucao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      mockDb.buscarUsuarioPorId.mockResolvedValue(usuarioMock)
      mockDb.buscarItemPorId.mockResolvedValue(itemMock)
      mockDb.contarEmprestimosAtivos.mockResolvedValue(0)
      vi.mocked(calcularDataDevolucao).mockReturnValue(dataDevolucao)
      mockDb.criarEmprestimo.mockResolvedValue({
        id: "emp-1",
        ...dadosEmprestimo,
        dataEmprestimo: dataEmprestimo.toISOString(),
        dataDevolucaoPrevista: dataDevolucao.toISOString(),
        status: "ativo",
      })

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimo).toBeDefined()
      expect(mockDb.buscarUsuarioPorId).toHaveBeenCalledWith(dadosEmprestimo.usuarioId)
      expect(mockDb.buscarItemPorId).toHaveBeenCalledWith(dadosEmprestimo.itemId)
      expect(mockDb.contarEmprestimosAtivos).toHaveBeenCalledWith(dadosEmprestimo.usuarioId)
      expect(calcularDataDevolucao).toHaveBeenCalledWith(usuarioMock.categoria, expect.any(Date))
    })

    it("deve rejeitar empréstimo para usuário inexistente", async () => {
      // Arrange
      mockDb.buscarUsuarioPorId.mockResolvedValue(null)

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário não encontrado")
      expect(mockDb.buscarItemPorId).not.toHaveBeenCalled()
    })

    it("deve rejeitar empréstimo para usuário inativo", async () => {
      // Arrange
      mockDb.buscarUsuarioPorId.mockResolvedValue({ ...usuarioMock, ativo: false })

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário inativo")
    })

    it("deve rejeitar empréstimo para item inexistente", async () => {
      // Arrange
      mockDb.buscarUsuarioPorId.mockResolvedValue(usuarioMock)
      mockDb.buscarItemPorId.mockResolvedValue(null)

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Item não encontrado")
    })

    it("deve rejeitar empréstimo para item indisponível", async () => {
      // Arrange
      mockDb.buscarUsuarioPorId.mockResolvedValue(usuarioMock)
      mockDb.buscarItemPorId.mockResolvedValue({ ...itemMock, disponivel: false })

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Item não disponível para empréstimo")
    })

    it("deve respeitar limite de empréstimos por categoria", async () => {
      // Arrange
      mockDb.buscarUsuarioPorId.mockResolvedValue(usuarioMock)
      mockDb.buscarItemPorId.mockResolvedValue(itemMock)
      mockDb.contarEmprestimosAtivos.mockResolvedValue(3) // Limite para estudante

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Limite de 3 empréstimos atingido")
    })

    it("deve aplicar limites corretos por categoria", async () => {
      // Arrange
      const categorias = [
        { categoria: "estudante", limite: 3 },
        { categoria: "professor", limite: 5 },
        { categoria: "visitante", limite: 1 },
      ]

      for (const { categoria, limite } of categorias) {
        mockDb.buscarUsuarioPorId.mockResolvedValue({ ...usuarioMock, categoria })
        mockDb.buscarItemPorId.mockResolvedValue(itemMock)
        mockDb.contarEmprestimosAtivos.mockResolvedValue(limite) // No limite

        // Act
        const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

        // Assert
        expect(resultado.sucesso).toBe(false)
        expect(resultado.erro).toBe(`Limite de ${limite} empréstimos atingido`)
      }
    })

    it("deve lidar com erro interno", async () => {
      // Arrange
      mockDb.buscarUsuarioPorId.mockRejectedValue(new Error("Erro de conexão"))

      // Act
      const resultado = await emprestimoService.registrarEmprestimo(dadosEmprestimo)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Erro interno do servidor")
    })
  })

  describe("consultarEmprestimos", () => {
    it("deve retornar todos os empréstimos quando não há filtro", async () => {
      // Arrange
      const emprestimosMock = [
        { id: "emp-1", usuarioId: "user-1", status: "ativo" },
        { id: "emp-2", usuarioId: "user-2", status: "devolvido" },
      ]
      mockDb.buscarEmprestimos.mockResolvedValue(emprestimosMock)

      // Act
      const resultado = await emprestimoService.consultarEmprestimos()

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimos).toEqual(emprestimosMock)
      expect(mockDb.buscarEmprestimos).toHaveBeenCalledWith(undefined)
    })

    it("deve aplicar filtros corretamente", async () => {
      // Arrange
      const filtro = { usuarioId: "user-1", status: "ativo" }
      const emprestimosFiltrados = [{ id: "emp-1", usuarioId: "user-1", status: "ativo" }]
      mockDb.buscarEmprestimos.mockResolvedValue(emprestimosFiltrados)

      // Act
      const resultado = await emprestimoService.consultarEmprestimos(filtro)

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimos).toEqual(emprestimosFiltrados)
      expect(mockDb.buscarEmprestimos).toHaveBeenCalledWith(filtro)
    })

    it("deve lidar com erro na consulta", async () => {
      // Arrange
      mockDb.buscarEmprestimos.mockRejectedValue(new Error("Erro de consulta"))

      // Act
      const resultado = await emprestimoService.consultarEmprestimos()

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Erro ao consultar empréstimos")
    })
  })
})
