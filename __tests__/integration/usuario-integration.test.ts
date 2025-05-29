import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest"
import { DatabaseReal } from "@/lib/database-real"
import { UsuarioService } from "@/lib/services/usuario-service"
import path from "path"

describe("Integração - Gestão de Usuários", () => {
  let db: DatabaseReal
  let usuarioService: UsuarioService
  const testDbPath = path.join(process.cwd(), "test-usuarios.sqlite")

  beforeAll(async () => {
    db = new DatabaseReal(testDbPath)
    usuarioService = new UsuarioService()
    // Substituir o banco em memória pelo banco real nos testes
    ;(usuarioService as any).db = db
  })

  afterAll(async () => {
    await db.fechar()
  })

  beforeEach(async () => {
    await db.limparDados()
  })

  describe("Caso de Uso: Cadastrar Usuário", () => {
    it("deve cadastrar usuário completo no banco de dados", async () => {
      // Arrange
      const dadosUsuario = {
        nome: "Maria Silva Santos",
        dataNascimento: "1990-03-15",
        cpf: "123.456.789-09",
        telefone: "(11) 98765-4321",
        endereco: "Rua das Palmeiras, 456, São Paulo-SP",
        categoria: "professor" as const,
        email: "maria.silva@cesupa.br",
        matricula: "PROF2023001",
        departamento: "Engenharia de Software",
      }

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosUsuario)

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuario).toBeDefined()
      expect(resultado.usuario?.nome).toBe(dadosUsuario.nome)
      expect(resultado.usuario?.cpf).toBe(dadosUsuario.cpf)
      expect(resultado.usuario?.ativo).toBe(true)

      // Verificar se foi salvo no banco
      const usuarioNoBanco = await db.buscarUsuarioPorCpf(dadosUsuario.cpf)
      expect(usuarioNoBanco).toBeDefined()
      expect(usuarioNoBanco?.nome).toBe(dadosUsuario.nome)
      expect(usuarioNoBanco?.email).toBe(dadosUsuario.email)
    })

    it("deve rejeitar CPF duplicado no banco de dados", async () => {
      // Arrange
      const cpfDuplicado = "111.222.333-44"
      const primeiroUsuario = {
        nome: "Primeiro Usuário",
        dataNascimento: "1985-01-01",
        cpf: cpfDuplicado,
        telefone: "(11) 11111-1111",
        endereco: "Endereço 1",
        categoria: "estudante" as const,
      }

      const segundoUsuario = {
        nome: "Segundo Usuário",
        dataNascimento: "1990-01-01",
        cpf: cpfDuplicado,
        telefone: "(11) 22222-2222",
        endereco: "Endereço 2",
        categoria: "professor" as const,
      }

      // Act
      const primeiroCadastro = await usuarioService.cadastrarUsuario(primeiroUsuario)
      const segundoCadastro = await usuarioService.cadastrarUsuario(segundoUsuario)

      // Assert
      expect(primeiroCadastro.sucesso).toBe(true)
      expect(segundoCadastro.sucesso).toBe(false)
      expect(segundoCadastro.erro).toBe("CPF já cadastrado no sistema")

      // Verificar que apenas um usuário existe no banco
      const usuarios = await db.buscarUsuarios({ cpf: cpfDuplicado })
      expect(usuarios).toHaveLength(1)
      expect(usuarios[0].nome).toBe(primeiroUsuario.nome)
    })

    it("deve validar dados obrigatórios", async () => {
      // Arrange
      const dadosInvalidos = {
        nome: "Usuário Teste",
        dataNascimento: "1990-01-01",
        cpf: "123.456.789-00", // CPF inválido
        telefone: "(11) 99999-9999",
        endereco: "Rua Teste",
        categoria: "estudante" as const,
        email: "email-invalido", // Email inválido
      }

      // Act
      const resultado = await usuarioService.cadastrarUsuario(dadosInvalidos)

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("CPF inválido")

      // Verificar que nenhum usuário foi salvo
      const usuarios = await db.buscarUsuarios()
      expect(usuarios).toHaveLength(0)
    })
  })

  describe("Caso de Uso: Consultar Usuários", () => {
    beforeEach(async () => {
      // Inserir dados de teste
      await db.criarUsuario({
        nome: "Ana Costa",
        dataNascimento: "1988-07-20",
        cpf: "987.654.321-00",
        telefone: "(21) 98765-4321",
        endereco: "Av. Atlântica, 100, Rio de Janeiro-RJ",
        categoria: "professor",
        email: "ana.costa@cesupa.br",
        matricula: "PROF2023002",
        departamento: "Matemática",
        ativo: true,
      })

      await db.criarUsuario({
        nome: "Carlos Oliveira",
        dataNascimento: "2000-12-10",
        cpf: "456.789.123-00",
        telefone: "(85) 91234-5678",
        endereco: "Rua do Sol, 789, Fortaleza-CE",
        categoria: "estudante",
        email: "carlos.oliveira@cesupa.br",
        matricula: "EST2023003",
        departamento: "Ciência da Computação",
        ativo: true,
      })
    })

    it("deve buscar todos os usuários", async () => {
      // Act
      const resultado = await usuarioService.consultarUsuarios()

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toBeDefined()
      expect(resultado.usuarios).toHaveLength(2)
    })

    it("deve filtrar usuários por nome", async () => {
      // Act
      const resultado = await usuarioService.consultarUsuarios({ nome: "Ana" })

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toHaveLength(1)
      expect(resultado.usuarios?.[0].nome).toBe("Ana Costa")
    })

    it("deve filtrar usuários por CPF", async () => {
      // Act
      const resultado = await usuarioService.consultarUsuarios({ cpf: "456.789.123-00" })

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toHaveLength(1)
      expect(resultado.usuarios?.[0].nome).toBe("Carlos Oliveira")
    })

    it("deve retornar lista vazia para filtro sem resultados", async () => {
      // Act
      const resultado = await usuarioService.consultarUsuarios({ nome: "Inexistente" })

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.usuarios).toHaveLength(0)
    })
  })

  describe("Caso de Uso: Atualizar Usuário", () => {
    let usuarioId: string

    beforeEach(async () => {
      const usuario = await db.criarUsuario({
        nome: "Pedro Santos",
        dataNascimento: "1992-04-25",
        cpf: "789.123.456-00",
        telefone: "(31) 99876-5432",
        endereco: "Rua das Acácias, 321, Belo Horizonte-MG",
        categoria: "estudante",
        email: "pedro.santos@cesupa.br",
        matricula: "EST2023004",
        departamento: "Engenharia",
        ativo: true,
      })
      usuarioId = usuario.id
    })

    it("deve atualizar dados do usuário no banco", async () => {
      // Arrange
      const novosDados = {
        telefone: "(31) 91111-1111",
        email: "pedro.santos.novo@cesupa.br",
        endereco: "Nova Rua, 123, Belo Horizonte-MG",
      }

      // Act
      const resultado = await usuarioService.atualizarUsuario(usuarioId, novosDados, "Admin Teste")

      // Assert
      expect(resultado.sucesso).toBe(true)

      // Verificar no banco
      const usuarioAtualizado = await db.buscarUsuarioPorId(usuarioId)
      expect(usuarioAtualizado?.telefone).toBe(novosDados.telefone)
      expect(usuarioAtualizado?.email).toBe(novosDados.email)
      expect(usuarioAtualizado?.endereco).toBe(novosDados.endereco)
    })

    it("deve rejeitar atualização com email inválido", async () => {
      // Act
      const resultado = await usuarioService.atualizarUsuario(usuarioId, { email: "email-invalido" }, "Admin Teste")

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Email inválido")

      // Verificar que o email não foi alterado no banco
      const usuario = await db.buscarUsuarioPorId(usuarioId)
      expect(usuario?.email).toBe("pedro.santos@cesupa.br")
    })

    it("deve retornar erro para usuário inexistente", async () => {
      // Act
      const resultado = await usuarioService.atualizarUsuario(
        "id-inexistente",
        { telefone: "novo-telefone" },
        "Admin Teste",
      )

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário não encontrado")
    })
  })

  describe("Caso de Uso: Inativar Usuário", () => {
    let usuarioId: string

    beforeEach(async () => {
      const usuario = await db.criarUsuario({
        nome: "Lucia Fernandes",
        dataNascimento: "1987-09-12",
        cpf: "321.654.987-00",
        telefone: "(41) 98765-1234",
        endereco: "Av. Brasil, 456, Curitiba-PR",
        categoria: "visitante",
        ativo: true,
      })
      usuarioId = usuario.id
    })

    it("deve inativar usuário sem empréstimos ativos", async () => {
      // Act
      const resultado = await usuarioService.inativarUsuario(usuarioId, "Usuário solicitou inativação", "Admin Teste")

      // Assert
      expect(resultado.sucesso).toBe(true)

      // Verificar no banco que o usuário foi inativado
      const usuario = await db.buscarUsuarioPorId(usuarioId)
      expect(usuario?.ativo).toBe(false)
    })

    it("deve rejeitar inativação de usuário com empréstimos ativos", async () => {
      // Arrange - Criar item e empréstimo ativo
      const item = await db.criarItem({
        titulo: "Livro Teste",
        codigo: "LT001",
        autor: "Autor Teste",
        categoria: "Teste",
        disponivel: false,
      })

      await db.criarEmprestimo({
        usuarioId,
        itemId: item.id,
        dataEmprestimo: new Date().toISOString(),
        dataDevolucaoPrevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ativo",
        bibliotecario: "Sistema Teste",
      })

      // Act
      const resultado = await usuarioService.inativarUsuario(usuarioId, "Tentativa de inativação", "Admin Teste")

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário possui empréstimos ativos")

      // Verificar que o usuário continua ativo
      const usuario = await db.buscarUsuarioPorId(usuarioId)
      expect(usuario?.ativo).toBe(true)
    })
  })
})
