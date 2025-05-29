"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  nome: string
  email: string
  cpf: string
  categoria: "estudante" | "professor" | "visitante" | "bibliotecario"
}

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string, type: "email" | "cpf") => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

interface RegisterData {
  nome: string
  cpf: string
  dataNascimento: string
  email: string
  senha: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se há um usuário logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem("biblioteca_user")
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData) as User
          setUser(parsedUser)
        } catch {
          localStorage.removeItem("biblioteca_user")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (identifier: string, password: string, type: "email" | "cpf") => {
    setLoading(true)
    try {
      // Simulação de autenticação - em produção, fazer chamada para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Usuários de demonstração
      const demoUsers = [
        {
          id: "1",
          nome: "João Silva Santos",
          email: "joao.silva@cesupa.br",
          cpf: "123.456.789-09",
          categoria: "estudante" as const,
          senha: "123456",
        },
        {
          id: "2",
          nome: "Maria Costa",
          email: "maria.costa@cesupa.br",
          cpf: "987.654.321-00",
          categoria: "professor" as const,
          senha: "123456",
        },
        {
          id: "3",
          nome: "Admin Biblioteca",
          email: "admin@cesupa.br",
          cpf: "111.222.333-44",
          categoria: "bibliotecario" as const,
          senha: "admin123",
        },
      ]

      // Buscar usuário
      const foundUser = demoUsers.find((u) => {
        if (type === "email") {
          return u.email === identifier && u.senha === password
        }
        return u.cpf === identifier && u.senha === password
      })

      if (!foundUser) {
        throw new Error("Credenciais inválidas")
      }

      // Criar objeto do usuário sem a senha
      const userWithoutPassword: User = {
        id: foundUser.id,
        nome: foundUser.nome,
        email: foundUser.email,
        cpf: foundUser.cpf,
        categoria: foundUser.categoria,
      }

      setUser(userWithoutPassword)
      localStorage.setItem("biblioteca_user", JSON.stringify(userWithoutPassword))
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      // Simulação de registro - em produção, fazer chamada para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Criar novo usuário
      const newUser: User = {
        id: Date.now().toString(),
        nome: userData.nome,
        email: userData.email,
        cpf: userData.cpf,
        categoria: "estudante", // Novos usuários são estudantes por padrão
      }

      setUser(newUser)
      localStorage.setItem("biblioteca_user", JSON.stringify(newUser))
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("biblioteca_user")
    router.push("/login")
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: Boolean(user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
