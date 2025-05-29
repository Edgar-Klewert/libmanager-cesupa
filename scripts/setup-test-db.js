const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const fs = require("fs")

const testDbPath = path.join(process.cwd(), "test-biblioteca.sqlite")

// Remove existing test database
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath)
  console.log("🗑️  Removed existing test database")
}

const db = new sqlite3.Database(testDbPath, (err) => {
  if (err) {
    console.error("❌ Error creating test database:", err.message)
    process.exit(1)
  }
  console.log("✅ Connected to test SQLite database")
})

// Create tables
db.serialize(() => {
  console.log("📋 Creating test tables...")

  // Usuarios table
  db.run(
    `
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
  `,
    (err) => {
      if (err) console.error("❌ Error creating usuarios table:", err.message)
      else console.log("✅ Usuarios table created")
    },
  )

  // Itens acervo table
  db.run(
    `
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
  `,
    (err) => {
      if (err) console.error("❌ Error creating itens_acervo table:", err.message)
      else console.log("✅ Itens acervo table created")
    },
  )

  // Emprestimos table
  db.run(
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
      if (err) console.error("❌ Error creating emprestimos table:", err.message)
      else console.log("✅ Emprestimos table created")
    },
  )

  // Insert test data
  console.log("📚 Inserting test data...")

  // Test user
  db.run(`
    INSERT INTO usuarios (id, nome, dataNascimento, cpf, telefone, endereco, categoria, email, matricula, departamento, ativo, criadoEm, atualizadoEm)
    VALUES ('test-user-1', 'João Silva Santos', '1995-05-15', '123.456.789-00', '(91) 99999-9999', 'Rua das Flores, 123, Belém-PA', 'estudante', 'joao.silva@cesupa.br', '2023001', 'Ciência da Computação', 1, datetime('now'), datetime('now'))
  `)

  // Test book
  db.run(`
    INSERT INTO itens_acervo (id, titulo, isbn, codigo, autor, categoria, disponivel, criadoEm)
    VALUES ('test-book-1', 'Clean Code: A Handbook of Agile Software Craftsmanship', '978-0132350884', 'CC001', 'Robert C. Martin', 'Tecnologia', 1, datetime('now'))
  `)

  console.log("✅ Test data inserted")
  console.log("🎉 Test database setup completed!")
  console.log(`📍 Test database location: ${testDbPath}`)
})

db.close((err) => {
  if (err) {
    console.error("❌ Error closing database:", err.message)
  } else {
    console.log("🔒 Test database connection closed")
  }
})
