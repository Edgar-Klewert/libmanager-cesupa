"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { LogIn } from "lucide-react"
import { validarCPF, validarEmail } from "@/lib/validations"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [identifierType, setIdentifierType] = useState<"email" | "cpf">("email")
  const { login, loading } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validar campos
      if (!identifier) {
        throw new Error(`${identifierType === "email" ? "Email" : "CPF"} é obrigatório`)
      }

      if (!password) {
        throw new Error("Senha é obrigatória")
      }

      if (identifierType === "email" && !validarEmail(identifier)) {
        throw new Error("Email inválido")
      }

      if (identifierType === "cpf" && !validarCPF(identifier)) {
        throw new Error("CPF inválido")
      }

      await login(identifier, password, identifierType)

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      })
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer login",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">Entrar na Conta</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Entre com seu email/CPF e senha para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm">
              <p className="font-medium text-blue-800 mb-2">Usuários de demonstração:</p>
              <div className="space-y-1 text-blue-700">
                <p className="break-all">
                  📚 <strong>Bibliotecário:</strong> admin@cesupa.br / senha: admin123
                </p>
                <p className="break-all">
                  👨‍🏫 <strong>Professor:</strong> maria.costa@cesupa.br / senha: 123456
                </p>
                <p className="break-all">
                  🎓 <strong>Estudante:</strong> joao.silva@cesupa.br / senha: 123456
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Tabs defaultValue="email" onValueChange={(value) => setIdentifierType(value as "email" | "cpf")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="email" className="text-xs sm:text-sm">
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="cpf" className="text-xs sm:text-sm">
                    CPF
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="cpf" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm">
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">
                    Senha
                  </Label>
                  <Link href="/recuperar-senha" className="text-xs sm:text-sm text-blue-600 hover:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base h-10 sm:h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col pt-4">
            <div className="text-center text-xs sm:text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/registro" className="text-blue-600 hover:underline font-medium">
                Registre-se aqui
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
