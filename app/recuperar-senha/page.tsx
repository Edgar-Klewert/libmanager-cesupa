"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Send } from "lucide-react"
import { validarEmail } from "@/lib/validations"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar email
      if (!email) {
        throw new Error("Email é obrigatório")
      }

      if (!validarEmail(email)) {
        throw new Error("Email inválido")
      }

      // Simulação de envio - em produção, substituir por chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sucesso
      setEnviado(true)
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      })
    } catch (error) {
      toast({
        title: "Erro ao enviar email",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
            <CardDescription>
              {!enviado
                ? "Digite seu email para receber instruções de recuperação de senha"
                : "Verifique seu email para redefinir sua senha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!enviado ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar instruções
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-green-600">
                  Um email com instruções para redefinir sua senha foi enviado para {email}.
                </p>
                <p className="text-sm text-gray-600">
                  Se não receber o email em alguns minutos, verifique sua pasta de spam ou tente novamente.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setEnviado(false)
                    setEmail("")
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm text-gray-600 mt-2">
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Voltar para o login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
