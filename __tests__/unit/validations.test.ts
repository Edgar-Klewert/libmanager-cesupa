import { describe, it, expect } from "vitest"
import { validarCPF, validarEmail, formatarCPF, calcularDataDevolucao } from "@/lib/validations"

describe("Validações - Testes Unitários", () => {
  describe("validarCPF", () => {
    it("deve validar CPFs corretos", () => {
      const cpfsValidos = ["123.456.789-09", "12345678909", "111.444.777-35", "11144477735"]

      cpfsValidos.forEach((cpf) => {
        expect(validarCPF(cpf)).toBe(true)
      })
    })

    it("deve rejeitar CPFs inválidos", () => {
      const cpfsInvalidos = [
        "123.456.789-00", // Dígito verificador incorreto
        "111.111.111-11", // Todos os dígitos iguais
        "123.456.789-99", // Dígito verificador incorreto
        "123", // Muito curto
        "", // Vazio
        "abc.def.ghi-jk", // Não numérico
        "123.456.789", // Sem dígito verificador
        "123.456.789-1", // Dígito verificador incompleto
      ]

      cpfsInvalidos.forEach((cpf) => {
        expect(validarCPF(cpf)).toBe(false)
      })
    })

    it("deve validar CPF com diferentes formatações", () => {
      const cpf = "123.456.789-09"
      const cpfSemFormatacao = "12345678909"
      const cpfComEspacos = " 123.456.789-09 "

      expect(validarCPF(cpf)).toBe(true)
      expect(validarCPF(cpfSemFormatacao)).toBe(true)
      expect(validarCPF(cpfComEspacos.trim())).toBe(true)
    })
  })

  describe("validarEmail", () => {
    it("deve validar emails corretos", () => {
      const emailsValidos = [
        "teste@exemplo.com",
        "usuario.teste@dominio.com.br",
        "admin@cesupa.br",
        "joao.silva123@universidade.edu.br",
        "contato+info@empresa.org",
      ]

      emailsValidos.forEach((email) => {
        expect(validarEmail(email)).toBe(true)
      })
    })

    it("deve rejeitar emails inválidos", () => {
      const emailsInvalidos = [
        "email-invalido", // Sem @
        "@dominio.com", // Sem parte local
        "teste@", // Sem domínio
        "teste@dominio", // Sem TLD
        "", // Vazio
        "teste..teste@dominio.com", // Pontos consecutivos
        "teste@dominio..com", // Pontos consecutivos no domínio
        "teste @dominio.com", // Espaço na parte local
        "teste@dominio .com", // Espaço no domínio
      ]

      emailsInvalidos.forEach((email) => {
        expect(validarEmail(email)).toBe(false)
      })
    })
  })

  describe("formatarCPF", () => {
    it("deve formatar CPF corretamente", () => {
      expect(formatarCPF("12345678909")).toBe("123.456.789-09")
      expect(formatarCPF("11144477735")).toBe("111.444.777-35")
    })

    it("deve manter formatação existente", () => {
      expect(formatarCPF("123.456.789-09")).toBe("123.456.789-09")
    })

    it("deve remover caracteres não numéricos antes de formatar", () => {
      expect(formatarCPF("123abc456def789ghi09")).toBe("123.456.789-09")
      expect(formatarCPF("123 456 789 09")).toBe("123.456.789-09")
    })
  })

  describe("calcularDataDevolucao", () => {
    const dataBase = new Date("2024-01-01T10:00:00.000Z")

    it("deve calcular prazo correto para estudante (7 dias)", () => {
      const dataDevolucao = calcularDataDevolucao("estudante", dataBase)
      const dataEsperada = new Date("2024-01-08T10:00:00.000Z")

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })

    it("deve calcular prazo correto para professor (14 dias)", () => {
      const dataDevolucao = calcularDataDevolucao("professor", dataBase)
      const dataEsperada = new Date("2024-01-15T10:00:00.000Z")

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })

    it("deve calcular prazo correto para visitante (3 dias)", () => {
      const dataDevolucao = calcularDataDevolucao("visitante", dataBase)
      const dataEsperada = new Date("2024-01-04T10:00:00.000Z")

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })

    it("deve usar prazo padrão para categoria inválida", () => {
      const dataDevolucao = calcularDataDevolucao("categoria-inexistente", dataBase)
      const dataEsperada = new Date("2024-01-08T10:00:00.000Z") // 7 dias (padrão)

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })

    it("deve funcionar com diferentes datas", () => {
      const dataVerao = new Date("2024-07-15T14:30:00.000Z")
      const dataDevolucao = calcularDataDevolucao("estudante", dataVerao)
      const dataEsperada = new Date("2024-07-22T14:30:00.000Z")

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })

    it("deve lidar com mudança de mês", () => {
      const fimDoMes = new Date("2024-01-29T10:00:00.000Z")
      const dataDevolucao = calcularDataDevolucao("estudante", fimDoMes)
      const dataEsperada = new Date("2024-02-05T10:00:00.000Z")

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })

    it("deve lidar com ano bissexto", () => {
      const fevereiro = new Date("2024-02-26T10:00:00.000Z") // 2024 é bissexto
      const dataDevolucao = calcularDataDevolucao("estudante", fevereiro)
      const dataEsperada = new Date("2024-03-05T10:00:00.000Z")

      expect(dataDevolucao.getTime()).toBe(dataEsperada.getTime())
    })
  })
})
