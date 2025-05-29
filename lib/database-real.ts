import sqlite3 from "sqlite3"
import path from "path"

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
}

export interface ItemAcervo {
  id: string
  titulo: string
  isbn?: string
  codigo: string
  autor: string
  categoria: string
  disponivel: boolean
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

export class DatabaseReal {
  private db: sqlite3.Database
  private dbPath: string

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), "biblioteca.sqlite")
    this.db = new sqlite3.Database(this.dbPath)
    this.initializeTables()
  }

  private initializeTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Tabela de usuários
        this.db.run(`
          CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            dataNascimento TEXT NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            telefone TEXT NOT NULL,
            endereco TEXT NOT NULL,
            categoria TEXT NOT NULL,
            email TEXT,
            matricula TEXT,
            departamento TEXT,
            ativo INTEGER DEFAULT 1,
            criadoEm TEXT NOT NULL,
            atualizadoEm TEXT NOT NULL
          )
        `)

        // Tabela de itens do acervo
        this.db.run(`
          CREATE TABLE IF NOT EXISTS itens_acervo (
            id TEXT PRIMARY KEY,
            titulo TEXT NOT NULL,
            isbn TEXT,
            codigo TEXT UNIQUE NOT NULL,
            autor TEXT NOT NULL,
            categoria TEXT NOT NULL,
            disponivel INTEGER DEFAULT 1,
            criadoEm TEXT NOT NULL
          )
        `)

        // Tabela de empréstimos
        this.db.run(
          `
          CREATE TABLE IF NOT EXISTS emprestimos (
            id TEXT PRIMARY KEY,
            usuarioId TEXT NOT NULL,
            itemId TEXT NOT NULL,
            dataEmprestimo TEXT NOT NULL,
            dataDevolucaoPrevista TEXT NOT NULL,
            dataDevolucaoReal TEXT,
            status TEXT NOT NULL,
            bibliotecario TEXT NOT NULL,
            criadoEm TEXT NOT NULL,
            FOREIGN KEY (usuarioId) REFERENCES usuarios (id),
            FOREIGN KEY (itemId) REFERENCES itens_acervo (id)
          )
        `,
          (err) => {
            if (err) reject(err)
            else resolve()
          },
        )
      })
    })
  }

  // Métodos para Usuários
  async criarUsuario(dados: Omit<Usuario, "id" | "criadoEm" | "atualizadoEm">): Promise<Usuario> {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString()
      const agora = new Date().toISOString()

      const stmt = this.db.prepare(`
        INSERT INTO usuarios (id, nome, dataNascimento, cpf, telefone, endereco, categoria, email, matricula, departamento, ativo, criadoEm, atualizadoEm)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        id,
        dados.nome,
        dados.dataNascimento,
        dados.cpf,
        dados.telefone,
        dados.endereco,
        dados.categoria,
        dados.email || null,
        dados.matricula || null,
        dados.departamento || null,
        dados.ativo ? 1 : 0,
        agora,
        agora,
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              id,
              ...dados,
              criadoEm: agora,
              atualizadoEm: agora,
            })
          }
        },
      )

      stmt.finalize()
    })
  }

  async buscarUsuarioPorCpf(cpf: string): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM usuarios WHERE cpf = ?", [cpf], (err, row: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(row ? { ...row, ativo: Boolean(row.ativo) } : null)
        }
      })
    })
  }

  async buscarUsuarioPorId(id: string): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM usuarios WHERE id = ?", [id], (err, row: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(row ? { ...row, ativo: Boolean(row.ativo) } : null)
        }
      })
    })
  }

  async buscarUsuarios(filtro?: { nome?: string; cpf?: string; id?: string; matricula?: string }): Promise<Usuario[]> {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM usuarios WHERE 1=1"
      const params: any[] = []

      if (filtro?.nome) {
        query += " AND nome LIKE ?"
        params.push(`%${filtro.nome}%`)
      }
      if (filtro?.cpf) {
        query += " AND cpf = ?"
        params.push(filtro.cpf)
      }
      if (filtro?.id) {
        query += " AND id = ?"
        params.push(filtro.id)
      }
      if (filtro?.matricula) {
        query += " AND matricula = ?"
        params.push(filtro.matricula)
      }

      query += " ORDER BY criadoEm DESC"

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows.map((row) => ({ ...row, ativo: Boolean(row.ativo) })))
        }
      })
    })
  }

  async atualizarUsuario(id: string, dados: Partial<Usuario>): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      const campos = Object.keys(dados)
        .filter((key) => key !== "id")
        .map((key) => `${key} = ?`)
        .join(", ")
      const valores = Object.values(dados).filter((_, index) => Object.keys(dados)[index] !== "id")
      valores.push(new Date().toISOString()) // atualizadoEm
      valores.push(id)

      const stmt = this.db.prepare(`
        UPDATE usuarios SET ${campos}, atualizadoEm = ? WHERE id = ?
      `)

      stmt.run(valores, function (err) {
        if (err) {
          reject(err)
        } else if (this.changes === 0) {
          resolve(null)
        } else {
          // Buscar o usuário atualizado
          resolve(null) // Simplificado para o exemplo
        }
      })

      stmt.finalize()
    })
  }

  // Métodos para Itens do Acervo
  async criarItem(dados: Omit<ItemAcervo, "id" | "criadoEm">): Promise<ItemAcervo> {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString()
      const agora = new Date().toISOString()

      const stmt = this.db.prepare(`
        INSERT INTO itens_acervo (id, titulo, isbn, codigo, autor, categoria, disponivel, criadoEm)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        id,
        dados.titulo,
        dados.isbn || null,
        dados.codigo,
        dados.autor,
        dados.categoria,
        dados.disponivel ? 1 : 0,
        agora,
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              id,
              ...dados,
              criadoEm: agora,
            })
          }
        },
      )

      stmt.finalize()
    })
  }

  async buscarItemPorId(id: string): Promise<ItemAcervo | null> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM itens_acervo WHERE id = ?", [id], (err, row: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(row ? { ...row, disponivel: Boolean(row.disponivel) } : null)
        }
      })
    })
  }

  async buscarItens(filtro?: { titulo?: string; codigo?: string; isbn?: string }): Promise<ItemAcervo[]> {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM itens_acervo WHERE 1=1"
      const params: any[] = []

      if (filtro?.titulo) {
        query += " AND titulo LIKE ?"
        params.push(`%${filtro.titulo}%`)
      }
      if (filtro?.codigo) {
        query += " AND codigo = ?"
        params.push(filtro.codigo)
      }
      if (filtro?.isbn) {
        query += " AND isbn = ?"
        params.push(filtro.isbn)
      }

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows.map((row) => ({ ...row, disponivel: Boolean(row.disponivel) })))
        }
      })
    })
  }

  // Métodos para Empréstimos
  async criarEmprestimo(dados: Omit<Emprestimo, "id" | "criadoEm">): Promise<Emprestimo> {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString()
      const agora = new Date().toISOString()

      const stmt = this.db.prepare(`
        INSERT INTO emprestimos (id, usuarioId, itemId, dataEmprestimo, dataDevolucaoPrevista, dataDevolucaoReal, status, bibliotecario, criadoEm)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        id,
        dados.usuarioId,
        dados.itemId,
        dados.dataEmprestimo,
        dados.dataDevolucaoPrevista,
        dados.dataDevolucaoReal || null,
        dados.status,
        dados.bibliotecario,
        agora,
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              id,
              ...dados,
              criadoEm: agora,
            })
          }
        },
      )

      stmt.finalize()
    })
  }

  async buscarEmprestimos(filtro?: { usuarioId?: string; status?: string }): Promise<Emprestimo[]> {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM emprestimos WHERE 1=1"
      const params: any[] = []

      if (filtro?.usuarioId) {
        query += " AND usuarioId = ?"
        params.push(filtro.usuarioId)
      }
      if (filtro?.status) {
        query += " AND status = ?"
        params.push(filtro.status)
      }

      query += " ORDER BY criadoEm DESC"

      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  async contarEmprestimosAtivos(usuarioId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT COUNT(*) as count FROM emprestimos WHERE usuarioId = ? AND status = 'ativo'",
        [usuarioId],
        (err, row: any) => {
          if (err) {
            reject(err)
          } else {
            resolve(row.count)
          }
        },
      )
    })
  }

  async limparDados(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("DELETE FROM emprestimos")
        this.db.run("DELETE FROM itens_acervo")
        this.db.run("DELETE FROM usuarios", (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    })
  }

  async fechar(): Promise<void> {
    return new Promise((resolve) => {
      this.db.close(() => {
        resolve()
      })
    })
  }
}
