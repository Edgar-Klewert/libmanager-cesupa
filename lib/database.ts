// Simulação de banco de dados em memória para o MVP
// Em produção, seria substituído por Prisma + PostgreSQL/MySQL

export interface Usuario {
  id: string
  nome: string
  dataNascimento: string
  cpf: string
  telefone: string
  endereco: string
  categoria: "estudante" | "professor" | "visitante"
  email?: string
  matricula?: string
  departamento?: string
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
  historico: HistoricoAlteracao[]
}

export interface HistoricoAlteracao {
  id: string
  usuarioId: string
  campo: string
  valorAnterior: string
  valorNovo: string
  alteradoPor: string
  alteradoEm: string
}

export interface ItemAcervo {
  id: string
  titulo: string
  isbn?: string
  codigo: string
  autor: string
  categoria: string
  quantidadeTotal: number
  quantidadeDisponivel: number
  quantidadeEmprestada: number
  criadoEm: string
}

export interface Emprestimo {
  id: string
  usuarioId: string
  itemId: string
  dataEmprestimo: string
  dataDevolucaoPrevista: string
  dataDevolucaoReal?: string
  status: "ativo" | "devolvido" | "atrasado"
  bibliotecario: string
  criadoEm: string
}

// Banco de dados em memória
class Database {
  private usuarios: Map<string, Usuario> = new Map()
  private itensAcervo: Map<string, ItemAcervo> = new Map()
  private emprestimos: Map<string, Emprestimo> = new Map()
  private historico: Map<string, HistoricoAlteracao> = new Map()

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    // Dados iniciais para demonstração
    const usuarioDemo: Usuario = {
      id: "1",
      nome: "João Silva Santos",
      dataNascimento: "1995-05-15",
      cpf: "123.456.789-00",
      telefone: "(91) 99999-9999",
      endereco: "Rua das Flores, 123, Belém-PA",
      categoria: "estudante",
      email: "joao.silva@cesupa.br",
      matricula: "2023001",
      departamento: "Ciência da Computação",
      ativo: true,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      historico: [],
    }

    const itemDemo: ItemAcervo = {
      id: "1",
      titulo: "Clean Code: A Handbook of Agile Software Craftsmanship",
      isbn: "978-0132350884",
      codigo: "CC001",
      autor: "Robert C. Martin",
      categoria: "Tecnologia",
      quantidadeTotal: 3,
      quantidadeDisponivel: 2,
      quantidadeEmprestada: 1,
      criadoEm: new Date().toISOString(),
    }

    // Adicionar mais livros de exemplo
    const itemDemo2: ItemAcervo = {
      id: "2",
      titulo: "Design Patterns: Elements of Reusable Object-Oriented Software",
      isbn: "978-0201633610",
      codigo: "DP001",
      autor: "Gang of Four",
      categoria: "Tecnologia",
      quantidadeTotal: 2,
      quantidadeDisponivel: 2,
      quantidadeEmprestada: 0,
      criadoEm: new Date().toISOString(),
    }

    const itemDemo3: ItemAcervo = {
      id: "3",
      titulo: "The Pragmatic Programmer",
      isbn: "978-0135957059",
      codigo: "PP001",
      autor: "David Thomas, Andrew Hunt",
      categoria: "Tecnologia",
      quantidadeTotal: 1,
      quantidadeDisponivel: 0,
      quantidadeEmprestada: 1,
      criadoEm: new Date().toISOString(),
    }

    this.usuarios.set(usuarioDemo.id, usuarioDemo)
    this.itensAcervo.set(itemDemo.id, itemDemo)
    this.itensAcervo.set(itemDemo2.id, itemDemo2)
    this.itensAcervo.set(itemDemo3.id, itemDemo3)
  }

  // Métodos para Usuários
  async criarUsuario(dados: Omit<Usuario, "id" | "criadoEm" | "atualizadoEm" | "historico">): Promise<Usuario> {
    const id = (this.usuarios.size + 1).toString()
    const agora = new Date().toISOString()

    const usuario: Usuario = {
      ...dados,
      id,
      criadoEm: agora,
      atualizadoEm: agora,
      historico: [],
    }

    this.usuarios.set(id, usuario)
    return usuario
  }

  async buscarUsuarios(filtro?: {
    nome?: string
    cpf?: string
    id?: string
    matricula?: string
  }): Promise<Usuario[]> {
    const usuarios = Array.from(this.usuarios.values())

    if (!filtro) return usuarios

    return usuarios.filter((usuario) => {
      if (filtro.nome && !usuario.nome.toLowerCase().includes(filtro.nome.toLowerCase())) {
        return false
      }
      if (filtro.cpf && usuario.cpf !== filtro.cpf) {
        return false
      }
      if (filtro.id && usuario.id !== filtro.id) {
        return false
      }
      if (filtro.matricula && usuario.matricula !== filtro.matricula) {
        return false
      }
      return true
    })
  }

  async buscarUsuarioPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.get(id) || null
  }

  async buscarUsuarioPorCpf(cpf: string): Promise<Usuario | null> {
    const usuarios = Array.from(this.usuarios.values())
    return usuarios.find((u) => u.cpf === cpf) || null
  }

  async atualizarUsuario(id: string, dados: Partial<Usuario>, alteradoPor: string): Promise<Usuario | null> {
    const usuario = this.usuarios.get(id)
    if (!usuario) return null

    const agora = new Date().toISOString()

    // Registrar histórico das alterações
    Object.entries(dados).forEach(([campo, valorNovo]) => {
      if (campo in usuario && usuario[campo as keyof Usuario] !== valorNovo) {
        const historicoId = (this.historico.size + 1).toString()
        const alteracao: HistoricoAlteracao = {
          id: historicoId,
          usuarioId: id,
          campo,
          valorAnterior: String(usuario[campo as keyof Usuario]),
          valorNovo: String(valorNovo),
          alteradoPor,
          alteradoEm: agora,
        }
        this.historico.set(historicoId, alteracao)
        usuario.historico.push(alteracao)
      }
    })

    const usuarioAtualizado = {
      ...usuario,
      ...dados,
      atualizadoEm: agora,
    }

    this.usuarios.set(id, usuarioAtualizado)
    return usuarioAtualizado
  }

  async inativarUsuario(id: string, motivo: string, inativadoPor: string): Promise<boolean> {
    const usuario = this.usuarios.get(id)
    if (!usuario) return false

    // Verificar se há empréstimos ativos
    const emprestimosAtivos = Array.from(this.emprestimos.values()).filter(
      (emp) => emp.usuarioId === id && emp.status === "ativo",
    )

    if (emprestimosAtivos.length > 0) {
      throw new Error("Usuário possui empréstimos ativos")
    }

    await this.atualizarUsuario(id, { ativo: false }, inativadoPor)
    return true
  }

  // Métodos para Itens do Acervo
  async buscarItens(filtro?: {
    titulo?: string
    codigo?: string
    isbn?: string
  }): Promise<ItemAcervo[]> {
    const itens = Array.from(this.itensAcervo.values())

    if (!filtro) return itens

    return itens.filter((item) => {
      if (filtro.titulo && !item.titulo.toLowerCase().includes(filtro.titulo.toLowerCase())) {
        return false
      }
      if (filtro.codigo && item.codigo !== filtro.codigo) {
        return false
      }
      if (filtro.isbn && item.isbn !== filtro.isbn) {
        return false
      }
      return true
    })
  }

  async buscarItemPorId(id: string): Promise<ItemAcervo | null> {
    return this.itensAcervo.get(id) || null
  }

  // Métodos para Empréstimos
  async criarEmprestimo(dados: Omit<Emprestimo, "id" | "criadoEm">): Promise<Emprestimo> {
    const id = (this.emprestimos.size + 1).toString()

    const emprestimo: Emprestimo = {
      ...dados,
      id,
      criadoEm: new Date().toISOString(),
    }

    // Atualizar quantidade do item
    const item = this.itensAcervo.get(dados.itemId)
    if (item) {
      item.quantidadeDisponivel -= 1
      item.quantidadeEmprestada += 1
      this.itensAcervo.set(dados.itemId, item)
    }

    this.emprestimos.set(id, emprestimo)
    return emprestimo
  }

  async buscarEmprestimos(filtro?: {
    usuarioId?: string
    status?: string
  }): Promise<Emprestimo[]> {
    const emprestimos = Array.from(this.emprestimos.values())

    if (!filtro) return emprestimos

    return emprestimos.filter((emprestimo) => {
      if (filtro.usuarioId && emprestimo.usuarioId !== filtro.usuarioId) {
        return false
      }
      if (filtro.status && emprestimo.status !== filtro.status) {
        return false
      }
      return true
    })
  }

  async contarEmprestimosAtivos(usuarioId: string): Promise<number> {
    const emprestimos = await this.buscarEmprestimos({ usuarioId, status: "ativo" })
    return emprestimos.length
  }

  async devolverEmprestimo(emprestimoId: string): Promise<boolean> {
    const emprestimo = this.emprestimos.get(emprestimoId)
    if (!emprestimo || emprestimo.status !== "ativo") {
      return false
    }

    // Atualizar status do empréstimo
    emprestimo.status = "devolvido"
    emprestimo.dataDevolucaoReal = new Date().toISOString()
    this.emprestimos.set(emprestimoId, emprestimo)

    // Atualizar quantidade do item
    const item = this.itensAcervo.get(emprestimo.itemId)
    if (item) {
      item.quantidadeDisponivel += 1
      item.quantidadeEmprestada -= 1
      this.itensAcervo.set(emprestimo.itemId, item)
    }

    return true
  }

  async criarItem(dados: Omit<ItemAcervo, "id" | "criadoEm" | "quantidadeEmprestada">): Promise<ItemAcervo> {
    const id = (this.itensAcervo.size + 1).toString()

    const item: ItemAcervo = {
      ...dados,
      id,
      quantidadeEmprestada: 0,
      criadoEm: new Date().toISOString(),
    }

    this.itensAcervo.set(id, item)
    return item
  }
}

export const db = new Database()
