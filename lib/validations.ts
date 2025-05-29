import type { CategoriaUsuario } from "@/lib/types"

export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, "")

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false

  // Validação do primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(cpfLimpo.charAt(i)) * (10 - i)
  }
  let resto = 11 - (soma % 11)
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cpfLimpo.charAt(9))) return false

  // Validação do segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(cpfLimpo.charAt(i)) * (11 - i)
  }
  resto = 11 - (soma % 11)
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cpfLimpo.charAt(10))) return false

  return true
}

export function validarEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, "")
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function calcularDataDevolucao(categoria: string, dataEmprestimo: Date): Date {
  const data = new Date(dataEmprestimo)

  const prazos = {
    estudante: 7,
    professor: 14,
    visitante: 3,
    ESTUDANTE: 7,
    PROFESSOR: 14,
    VISITANTE: 3,
  }

  const prazo = prazos[categoria as keyof typeof prazos] || 7
  data.setDate(data.getDate() + prazo)

  return data
}

export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, "")

  if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }

  return telefone
}

export function validarISBN(isbn: string): boolean {
  const isbnLimpo = isbn.replace(/\D/g, "")

  // ISBN-10 ou ISBN-13
  if (isbnLimpo.length !== 10 && isbnLimpo.length !== 13) {
    return false
  }

  if (isbnLimpo.length === 10) {
    // Validação ISBN-10
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += Number.parseInt(isbnLimpo.charAt(i)) * (10 - i)
    }
    const resto = 11 - (soma % 11)
    const digitoVerificador = resto === 10 ? "X" : resto === 11 ? "0" : resto.toString()
    return digitoVerificador === isbnLimpo.charAt(9).toUpperCase()
  } else {
    // Validação ISBN-13
    let soma = 0
    for (let i = 0; i < 12; i++) {
      const peso = i % 2 === 0 ? 1 : 3
      soma += Number.parseInt(isbnLimpo.charAt(i)) * peso
    }
    const resto = 10 - (soma % 10)
    const digitoVerificador = resto === 10 ? 0 : resto
    return digitoVerificador === Number.parseInt(isbnLimpo.charAt(12))
  }
}

export function formatarISBN(isbn: string): string {
  const isbnLimpo = isbn.replace(/\D/g, "")

  if (isbnLimpo.length === 13) {
    return isbnLimpo.replace(/(\d{3})(\d{1})(\d{5})(\d{3})(\d{1})/, "$1-$2-$3-$4-$5")
  } else if (isbnLimpo.length === 10) {
    return isbnLimpo.replace(/(\d{1})(\d{5})(\d{3})(\d{1})/, "$1-$2-$3-$4")
  }

  return isbn
}

// Função para converter categoria string para enum
export function converterCategoriaUsuario(categoria: string): CategoriaUsuario {
  const categoriaUpper = categoria.toUpperCase()
  if (categoriaUpper === "ESTUDANTE" || categoriaUpper === "PROFESSOR" || categoriaUpper === "VISITANTE") {
    return categoriaUpper as CategoriaUsuario
  }
  return "ESTUDANTE" // valor padrão
}

// Função para converter categoria enum para string legível
export function formatarCategoriaUsuario(categoria: CategoriaUsuario): string {
  const mapeamento = {
    ESTUDANTE: "Estudante",
    PROFESSOR: "Professor",
    VISITANTE: "Visitante",
  }
  return mapeamento[categoria] || "Estudante"
}
