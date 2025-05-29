import type {
  Usuario,
  ItemAcervo,
  Emprestimo,
  HistoricoAlteracao,
  CategoriaUsuario,
  StatusEmprestimo,
} from "@prisma/client"

// Tipos básicos do Prisma
export type { Usuario, ItemAcervo, Emprestimo, HistoricoAlteracao, CategoriaUsuario, StatusEmprestimo }

// Tipos com relacionamentos
export type UsuarioComHistorico = Usuario & {
  historico: HistoricoAlteracao[]
  emprestimos: Emprestimo[]
}

export type EmprestimoComRelacoes = Emprestimo & {
  usuario: Usuario
  item: ItemAcervo
}

export type ItemAcervoComEmprestimos = ItemAcervo & {
  emprestimos: Emprestimo[]
}

// Tipos para formulários
export type CriarUsuarioData = Omit<Usuario, "id" | "criadoEm" | "atualizadoEm">
export type AtualizarUsuarioData = Partial<Omit<Usuario, "id" | "criadoEm" | "atualizadoEm">>

export type CriarItemData = Omit<ItemAcervo, "id" | "criadoEm" | "atualizadoEm" | "quantidadeEmprestada">
export type AtualizarItemData = Partial<Omit<ItemAcervo, "id" | "criadoEm" | "atualizadoEm">>

export type CriarEmprestimoData = Omit<Emprestimo, "id" | "criadoEm" | "atualizadoEm" | "dataEmprestimo">

// Tipos para filtros
export interface FiltroUsuario {
  nome?: string
  cpf?: string
  categoria?: CategoriaUsuario
  ativo?: boolean
  matricula?: string
}

export interface FiltroItem {
  titulo?: string
  autor?: string
  categoria?: string
  codigo?: string
  isbn?: string
  disponivel?: boolean
}

export interface FiltroEmprestimo {
  usuarioId?: string
  itemId?: string
  status?: StatusEmprestimo
  dataInicio?: Date
  dataFim?: Date
}

// Tipos para respostas de API
export interface ResultadoOperacao<T = void> {
  sucesso: boolean
  erro?: string
  data?: T
}

export interface ResultadoUsuario extends ResultadoOperacao<Usuario> {
  usuario?: Usuario
}

export interface ResultadoUsuarios extends ResultadoOperacao<Usuario[]> {
  usuarios?: Usuario[]
}

export interface ResultadoItem extends ResultadoOperacao<ItemAcervo> {
  item?: ItemAcervo
}

export interface ResultadoItens extends ResultadoOperacao<ItemAcervo[]> {
  itens?: ItemAcervo[]
}

export interface ResultadoEmprestimo extends ResultadoOperacao<Emprestimo> {
  emprestimo?: Emprestimo
}

export interface ResultadoEmprestimos extends ResultadoOperacao<EmprestimoComRelacoes[]> {
  emprestimos?: EmprestimoComRelacoes[]
}
