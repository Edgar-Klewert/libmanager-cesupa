import { describe, it, expect } from "vitest"
import { validarCPF, validarEmail, formatarCPF, calcularDataDevolucao } from "@/lib/validations"

describe("Validações", () => {
  describe("validarCPF", () => {
    it("deve validar CPF correto", () => {
      expect(validarCPF("123.456.789-09")).toBe(true)
      expect(validarCPF("12345678909")).toBe(true)
    })

    it("deve rejeitar CPF inválido", () => {
      expect(validarCPF("123.456.789-00")).toBe(false)
      expect(validarCPF("111.111.111-11")).toBe(false)
      expect(validarCPF("123")).toBe(false)
    })
  })

  describe("validarEmail", () => {
    it("deve validar email correto", () => {
      expect(validarEmail("teste@exemplo.com")).toBe(true)
      expect(validarEmail("usuario.teste@dominio.com.br")).toBe(true)
    })

    it("deve rejeitar email inválido", () => {
      expect(validarEmail("email-invalido")).toBe(false)
      expect(validarEmail("@dominio.com")).toBe(false)
      expect(validarEmail("teste@")).toBe(false)
    })
  })

  describe("formatarCPF", () => {
    it("deve formatar CPF corretamente", () => {
      expect(formatarCPF("12345678909")).toBe("123.456.789-09")
      expect(formatarCPF("123.456.789-09")).toBe("123.456.789-09")
    })
  })

  describe("calcularDataDevolucao", () => {
    it("deve calcular prazo correto para estudante", () => {
      const dataEmprestimo = new Date("2024-01-01")
      const dataDevolucao = calcularDataDevolucao("estudante", dataEmprestimo)

      expect(dataDevolucao.getDate()).toBe(8) // 7 dias depois
    })

    it("deve calcular prazo correto para professor", () => {
      const dataEmprestimo = new Date("2024-01-01")
      const dataDevolucao = calcularDataDevolucao("professor", dataEmprestimo)

      expect(dataDevolucao.getDate()).toBe(15) // 14 dias depois
    })

    it("deve calcular prazo correto para visitante", () => {
      const dataEmprestimo = new Date("2024-01-01")
      const dataDevolucao = calcularDataDevolucao("visitante", dataEmprestimo)

      expect(dataDevolucao.getDate()).toBe(4) // 3 dias depois
    })
  })
})
