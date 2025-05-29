import { beforeAll, afterAll } from "vitest"
import fs from "fs"
import path from "path"

beforeAll(async () => {
  // Limpar bancos de teste antes de iniciar
  const testDbs = ["test-usuarios.sqlite", "test-emprestimos.sqlite", "test-biblioteca.sqlite"]

  for (const dbFile of testDbs) {
    const dbPath = path.join(process.cwd(), dbFile)
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }
  }

  console.log("🧹 Bancos de teste limpos")
})

afterAll(async () => {
  // Limpar bancos de teste após os testes
  const testDbs = ["test-usuarios.sqlite", "test-emprestimos.sqlite", "test-biblioteca.sqlite"]

  for (const dbFile of testDbs) {
    const dbPath = path.join(process.cwd(), dbFile)
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
    }
  }

  console.log("🧹 Bancos de teste removidos")
})
