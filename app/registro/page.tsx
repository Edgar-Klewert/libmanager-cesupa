"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { UserPlus } from "lucide-react"
import { validarCPF, validarEmail } from "@/lib/validations"
import { useAuth } from "@/contexts/auth-context"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  })
  const { register, loading } = useAuth()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Formatação especial para CPF
    if (name === "cpf") {
      const cpfLimpo = value.replace(/\D/g, "")
      if (cpfLimpo.length <= 11) {
        let cpfFormatado = cpfLimpo
        if (cpfLimpo.length > 9) {
          cpfFormatado = `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`
        } else if (cpfLimpo.length > 6) {
          cpfFormatado = `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6)}`
        } else if (cpfLimpo.length > 3) {
          cpfFormatado = `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3)}`
        }
        setFormData({ ...formData, [name]: cpfFormatado })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validar campos
      if (!formData.nome || !formData.cpf || !formData.dataNascimento || !formData.email || !formData.senha) {
        throw new Error("Todos os campos são obrigatórios")
      }

      if (!validarCPF(formData.cpf)) {
        throw new Error("CPF inválido")
      }

      if (!validarEmail(formData.email)) {
        throw new Error("Email inválido")
      }

      if (formData.senha.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres")
      }

      if (formData.senha !== formData.confirmarSenha) {
        throw new Error("As senhas não coincidem")
      }

      // Verificar idade mínima (13 anos)
      const dataNascimento = new Date(formData.dataNascimento)
      const hoje = new Date()
      const idade = hoje.getFullYear() - dataNascimento.getFullYear()
      const mesAtual = hoje.getMonth() - dataNascimento.getMonth()

      if (idade < 13 || (idade === 13 && mesAtual < 0)) {
        throw new Error("É necessário ter pelo menos 13 anos para se registrar")
      }

      await register(formData)

      toast({
        title: "Registro realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      })
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer o registro",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">Criar Nova Conta</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Preencha os dados abaixo para se registrar no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm">
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-sm">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-sm">
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm">
                  Senha
                </Label>
                <Input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-sm">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base h-10 sm:h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Criar Conta
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col pt-4">
            <div className="text-center text-xs sm:text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Fazer login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
