import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Limpar dados existentes
  await prisma.historicoAlteracao.deleteMany()
  await prisma.emprestimo.deleteMany()
  await prisma.itemAcervo.deleteMany()
  await prisma.usuario.deleteMany()

  // Criar usuários de exemplo
  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        nome: "João Silva Santos",
        dataNascimento: "1995-05-15",
        cpf: "11144477735",
        telefone: "(91) 99999-9999",
        endereco: "Rua das Flores, 123, Belém-PA",
        categoria: "ESTUDANTE",
        email: "joao.silva@cesupa.br",
        matricula: "2023001",
        departamento: "Ciência da Computação",
      },
    }),
    prisma.usuario.create({
      data: {
        nome: "Maria Oliveira Costa",
        dataNascimento: "1980-03-22",
        cpf: "22233344456",
        telefone: "(11) 98765-4321",
        endereco: "Av. Paulista, 1000, São Paulo-SP",
        categoria: "PROFESSOR",
        email: "maria.costa@cesupa.br",
        matricula: "PROF001",
        departamento: "Engenharia de Software",
      },
    }),
    prisma.usuario.create({
      data: {
        nome: "Carlos Mendes",
        dataNascimento: "1992-11-08",
        cpf: "33344455567",
        telefone: "(21) 91234-5678",
        endereco: "Rua Copacabana, 500, Rio de Janeiro-RJ",
        categoria: "VISITANTE",
        email: "carlos.mendes@email.com",
      },
    }),
  ])

  console.log(`✅ Criados ${usuarios.length} usuários`)

  // Criar itens do acervo
  const itens = await Promise.all([
    prisma.itemAcervo.create({
      data: {
        titulo: "Clean Code: A Handbook of Agile Software Craftsmanship",
        isbn: "9780132350884",
        codigo: "CC001",
        autor: "Robert C. Martin",
        categoria: "Tecnologia",
        quantidadeTotal: 3,
        quantidadeDisponivel: 3,
      },
    }),
    prisma.itemAcervo.create({
      data: {
        titulo: "Design Patterns: Elements of Reusable Object-Oriented Software",
        isbn: "9780201633610",
        codigo: "DP001",
        autor: "Gang of Four",
        categoria: "Tecnologia",
        quantidadeTotal: 2,
        quantidadeDisponivel: 2,
      },
    }),
    prisma.itemAcervo.create({
      data: {
        titulo: "The Pragmatic Programmer",
        isbn: "9780135957059",
        codigo: "PP001",
        autor: "David Thomas, Andrew Hunt",
        categoria: "Tecnologia",
        quantidadeTotal: 1,
        quantidadeDisponivel: 1,
      },
    }),
    prisma.itemAcervo.create({
      data: {
        titulo: "JavaScript: The Good Parts",
        isbn: "9780596517748",
        codigo: "JS001",
        autor: "Douglas Crockford",
        categoria: "Tecnologia",
        quantidadeTotal: 2,
        quantidadeDisponivel: 2,
      },
    }),
    prisma.itemAcervo.create({
      data: {
        titulo: "Algoritmos: Teoria e Prática",
        isbn: "9788535236996",
        codigo: "ALG001",
        autor: "Thomas H. Cormen",
        categoria: "Algoritmos",
        quantidadeTotal: 1,
        quantidadeDisponivel: 1,
      },
    }),
  ])

  console.log(`✅ Criados ${itens.length} itens do acervo`)

  // Criar alguns empréstimos de exemplo
  const emprestimos = await Promise.all([
    prisma.emprestimo.create({
      data: {
        usuarioId: usuarios[0].id,
        itemId: itens[0].id,
        dataDevolucaoPrevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        bibliotecario: "Sistema Seed",
        status: "ATIVO",
      },
    }),
  ])

  // Atualizar quantidade do item emprestado
  await prisma.itemAcervo.update({
    where: { id: itens[0].id },
    data: {
      quantidadeDisponivel: { decrement: 1 },
      quantidadeEmprestada: { increment: 1 },
    },
  })

  console.log(`✅ Criados ${emprestimos.length} empréstimos`)

  console.log("🎉 Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
