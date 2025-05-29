import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest"
import { DatabaseReal } from "@/lib/database-real"
import { EmprestimoService } from "@/lib/services/emprestimo-service"
import { UsuarioService } from "@/lib/services/usuario-service"
import path from "path"

describe("Integração - Sistema de Empréstimos", () => {
  let db: DatabaseReal
  let emprestimoService: EmprestimoService
  let usuarioService: UsuarioService
  const testDbPath = path.join(process.cwd(), "test-emprestimos.sqlite")

  beforeAll(async () => {
    db = new DatabaseReal(testDbPath)
    emprestimoService = new EmprestimoService()
    usuarioService = new UsuarioService()
    // Substituir o banco em memória pelo banco real nos testes
    ;(emprestimoService as any).db = db
    ;(usuarioService as any).db = db
  })

  afterAll(async () => {
    await db.fechar()
  })

  beforeEach(async () => {
    await db.limparDados()
  })

  describe("Caso de Uso: Registrar Empréstimo", () => {
    let usuarioId: string
    let itemId: string

    beforeEach(async () => {
      // Criar usuário de teste
      const usuario = await db.criarUsuario({
        nome: "João Empréstimo",
        dataNascimento: "1995-01-01",
        cpf: "123.456.789-01",
        telefone: "(11) 99999-9999",
        endereco: "Rua Teste, 123",
        categoria: "estudante",
        ativo: true,
      })
      usuarioId = usuario.id

      // Criar item de teste
      const item = await db.criarItem({
        titulo: "Clean Code",
        codigo: "CC001",
        autor: "Robert Martin",
        categoria: "Tecnologia",
        disponivel: true,
      })
      itemId = item.id
    })

    it("deve registrar empréstimo válido no banco de dados", async () => {
      // Act
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimo).toBeDefined()
      expect(resultado.emprestimo?.usuarioId).toBe(usuarioId)
      expect(resultado.emprestimo?.itemId).toBe(itemId)
      expect(resultado.emprestimo?.status).toBe("ativo")

      // Verificar se foi salvo no banco
      const emprestimos = await db.buscarEmprestimos({ usuarioId })
      expect(emprestimos).toHaveLength(1)
      expect(emprestimos[0].status).toBe("ativo")

      // Verificar se o item foi marcado como indisponível
      const item = await db.buscarItemPorId(itemId)
      expect(item?.disponivel).toBe(false)
    })

    it("deve calcular data de devolução correta para estudante", async () => {
      // Act
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(resultado.sucesso).toBe(true)

      const dataEmprestimo = new Date(resultado.emprestimo!.dataEmprestimo)
      const dataDevolucao = new Date(resultado.emprestimo!.dataDevolucaoPrevista)
      const diferencaDias = Math.ceil((dataDevolucao.getTime() - dataEmprestimo.getTime()) / (1000 * 60 * 60 * 24))

      expect(diferencaDias).toBe(7) // Estudante tem 7 dias
    })

    it("deve rejeitar empréstimo para usuário inativo", async () => {
      // Arrange - Inativar usuário
      await db.atualizarUsuario(usuarioId, { ativo: false })

      // Act
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Usuário inativo")

      // Verificar que nenhum empréstimo foi criado
      const emprestimos = await db.buscarEmprestimos()
      expect(emprestimos).toHaveLength(0)
    })

    it("deve rejeitar empréstimo para item indisponível", async () => {
      // Arrange - Marcar item como indisponível
      await db.criarItem({
        titulo: "Item Indisponível",
        codigo: "II001",
        autor: "Autor Teste",
        categoria: "Teste",
        disponivel: false,
      })

      const itensIndisponiveis = await db.buscarItens({ codigo: "II001" })
      const itemIndisponivel = itensIndisponiveis[0]

      // Act
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId: itemIndisponivel.id,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(resultado.sucesso).toBe(false)
      expect(resultado.erro).toBe("Item não disponível para empréstimo")
    })

    it("deve respeitar limite de empréstimos por categoria", async () => {
      // Arrange - Criar 3 itens para testar limite de estudante (3 empréstimos)
      const itens = []
      for (let i = 1; i <= 4; i++) {
        const item = await db.criarItem({
          titulo: `Livro ${i}`,
          codigo: `LV00${i}`,
          autor: `Autor ${i}`,
          categoria: "Teste",
          disponivel: true,
        })
        itens.push(item)
      }

      // Act - Fazer 3 empréstimos (limite para estudante)
      for (let i = 0; i < 3; i++) {
        const resultado = await emprestimoService.registrarEmprestimo({
          usuarioId,
          itemId: itens[i].id,
          bibliotecario: "Bibliotecário Teste",
        })
        expect(resultado.sucesso).toBe(true)
      }

      // Tentar fazer o 4º empréstimo (deve falhar)
      const quartoEmprestimo = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId: itens[3].id,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(quartoEmprestimo.sucesso).toBe(false)
      expect(quartoEmprestimo.erro).toBe("Limite de 3 empréstimos atingido")

      // Verificar que apenas 3 empréstimos foram criados
      const emprestimos = await db.buscarEmprestimos({ usuarioId })
      expect(emprestimos).toHaveLength(3)
    })
  })

  describe("Caso de Uso: Consultar Empréstimos", () => {
    let usuario1Id: string
    let usuario2Id: string
    let item1Id: string
    let item2Id: string

    beforeEach(async () => {
      // Criar usuários de teste
      const usuario1 = await db.criarUsuario({
        nome: "Usuário 1",
        dataNascimento: "1990-01-01",
        cpf: "111.111.111-11",
        telefone: "(11) 11111-1111",
        endereco: "Endereço 1",
        categoria: "estudante",
        ativo: true,
      })
      usuario1Id = usuario1.id

      const usuario2 = await db.criarUsuario({
        nome: "Usuário 2",
        dataNascimento: "1985-01-01",
        cpf: "222.222.222-22",
        telefone: "(22) 22222-2222",
        endereco: "Endereço 2",
        categoria: "professor",
        ativo: true,
      })
      usuario2Id = usuario2.id

      // Criar itens de teste
      const item1 = await db.criarItem({
        titulo: "Livro 1",
        codigo: "L001",
        autor: "Autor 1",
        categoria: "Categoria 1",
        disponivel: false,
      })
      item1Id = item1.id

      const item2 = await db.criarItem({
        titulo: "Livro 2",
        codigo: "L002",
        autor: "Autor 2",
        categoria: "Categoria 2",
        disponivel: false,
      })
      item2Id = item2.id

      // Criar empréstimos de teste
      await db.criarEmprestimo({
        usuarioId: usuario1Id,
        itemId: item1Id,
        dataEmprestimo: new Date().toISOString(),
        dataDevolucaoPrevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ativo",
        bibliotecario: "Bibliotecário 1",
      })

      await db.criarEmprestimo({
        usuarioId: usuario2Id,
        itemId: item2Id,
        dataEmprestimo: new Date().toISOString(),
        dataDevolucaoPrevista: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: "devolvido",
        bibliotecario: "Bibliotecário 2",
      })
    })

    it("deve buscar todos os empréstimos", async () => {
      // Act
      const resultado = await emprestimoService.consultarEmprestimos()

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimos).toHaveLength(2)
    })

    it("deve filtrar empréstimos por usuário", async () => {
      // Act
      const resultado = await emprestimoService.consultarEmprestimos({ usuarioId: usuario1Id })

      // Assert
      expect(resultado.sucesso).toBe(true)
      expect(resultado.emprestimos).toHaveLength(1)
      expect(resultado.emprestimos?.[0].usuarioId).toBe(usuario1Id)
    })

    it("deve filtrar empréstimos por status", async () => {
      // Act
      const resultadoAtivos = await emprestimoService.consultarEmprestimos({ status: "ativo" })
      const resultadoDevolvidos = await emprestimoService.consultarEmprestimos({ status: "devolvido" })

      // Assert
      expect(resultadoAtivos.sucesso).toBe(true)
      expect(resultadoAtivos.emprestimos).toHaveLength(1)
      expect(resultadoAtivos.emprestimos?.[0].status).toBe("ativo")

      expect(resultadoDevolvidos.sucesso).toBe(true)
      expect(resultadoDevolvidos.emprestimos).toHaveLength(1)
      expect(resultadoDevolvidos.emprestimos?.[0].status).toBe("devolvido")
    })

    it("deve contar empréstimos ativos corretamente", async () => {
      // Act
      const contagem1 = await db.contarEmprestimosAtivos(usuario1Id)
      const contagem2 = await db.contarEmprestimosAtivos(usuario2Id)

      // Assert
      expect(contagem1).toBe(1) // Usuário 1 tem 1 empréstimo ativo
      expect(contagem2).toBe(0) // Usuário 2 tem 0 empréstimos ativos (devolvido)
    })
  })

  describe("Caso de Uso: Controle de Disponibilidade", () => {
    let usuarioId: string
    let itemId: string

    beforeEach(async () => {
      const usuario = await db.criarUsuario({
        nome: "Usuário Disponibilidade",
        dataNascimento: "1990-01-01",
        cpf: "333.333.333-33",
        telefone: "(33) 33333-3333",
        endereco: "Endereço 3",
        categoria: "estudante",
        ativo: true,
      })
      usuarioId = usuario.id

      const item = await db.criarItem({
        titulo: "Livro Disponibilidade",
        codigo: "LD001",
        autor: "Autor Disponibilidade",
        categoria: "Teste",
        disponivel: true,
      })
      itemId = item.id
    })

    it("deve marcar item como indisponível após empréstimo", async () => {
      // Arrange - Verificar que item está disponível
      let item = await db.buscarItemPorId(itemId)
      expect(item?.disponivel).toBe(true)

      // Act - Registrar empréstimo
      const resultado = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(resultado.sucesso).toBe(true)

      // Verificar que item foi marcado como indisponível
      item = await db.buscarItemPorId(itemId)
      expect(item?.disponivel).toBe(false)
    })

    it("deve impedir múltiplos empréstimos do mesmo item", async () => {
      // Arrange - Criar segundo usuário
      const usuario2 = await db.criarUsuario({
        nome: "Segundo Usuário",
        dataNascimento: "1985-01-01",
        cpf: "444.444.444-44",
        telefone: "(44) 44444-4444",
        endereco: "Endereço 4",
        categoria: "professor",
        ativo: true,
      })

      // Act - Primeiro empréstimo
      const primeiroEmprestimo = await emprestimoService.registrarEmprestimo({
        usuarioId,
        itemId,
        bibliotecario: "Bibliotecário Teste",
      })

      // Tentar segundo empréstimo do mesmo item
      const segundoEmprestimo = await emprestimoService.registrarEmprestimo({
        usuarioId: usuario2.id,
        itemId,
        bibliotecario: "Bibliotecário Teste",
      })

      // Assert
      expect(primeiroEmprestimo.sucesso).toBe(true)
      expect(segundoEmprestimo.sucesso).toBe(false)
      expect(segundoEmprestimo.erro).toBe("Item não disponível para empréstimo")

      // Verificar que apenas um empréstimo foi criado
      const emprestimos = await db.buscarEmprestimos()
      expect(emprestimos).toHaveLength(1)
      expect(emprestimos[0].usuarioId).toBe(usuarioId)
    })
  })
})
