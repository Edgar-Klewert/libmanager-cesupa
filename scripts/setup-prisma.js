const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔧 Configurando Prisma...")

try {
  // Verificar se o arquivo .env existe
  const envPath = path.join(process.cwd(), ".env")
  if (!fs.existsSync(envPath)) {
    console.log("📝 Criando arquivo .env...")
    const envContent = `# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="your-jwt-secret-here"
`
    fs.writeFileSync(envPath, envContent)
    console.log("✅ Arquivo .env criado")
  }

  // Gerar cliente Prisma
  console.log("🔄 Gerando cliente Prisma...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Aplicar migrações
  console.log("🔄 Aplicando migrações...")
  execSync("npx prisma db push", { stdio: "inherit" })

  // Executar seed
  console.log("🌱 Populando banco de dados...")
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" })

  console.log("🎉 Prisma configurado com sucesso!")
  console.log("")
  console.log("📋 Comandos úteis:")
  console.log("  npm run db:studio    - Abrir Prisma Studio")
  console.log("  npm run db:generate  - Gerar cliente Prisma")
  console.log("  npm run db:push      - Aplicar mudanças no schema")
  console.log("  npm run db:migrate   - Criar nova migração")
  console.log("  npm run db:seed      - Popular banco com dados")
  console.log("  npm run db:reset     - Resetar banco de dados")
} catch (error) {
  console.error("❌ Erro ao configurar Prisma:", error.message)
  process.exit(1)
}
