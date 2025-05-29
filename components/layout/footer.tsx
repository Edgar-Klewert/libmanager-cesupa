"use client"

import { BookOpen, Mail, Phone, MapPin, Users, Library, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function Footer() {
  const { user } = useAuth()

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              <span className="text-base sm:text-lg font-bold">Biblioteca CESUPA</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {user
                ? "Sistema completo de gestão bibliotecária para a comunidade acadêmica do CESUPA."
                : "Plataforma digital para acesso ao acervo, empréstimos online e gestão bibliotecária do Centro Universitário do Estado do Pará."}
            </p>
            {user && (
              <div className="text-xs sm:text-sm text-gray-400 space-y-1">
                <p>
                  Logado como: <span className="text-white font-medium">{user.nome}</span>
                </p>
                <p>
                  Categoria: <span className="text-blue-400 font-medium">{user.categoria}</span>
                </p>
              </div>
            )}
          </div>

          {/* Links Rápidos */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">
              {user ? "Links Rápidos" : "Acesso ao Sistema"}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {user ? (
                // Links para usuários autenticados
                <>
                  <li>
                    <Link
                      href="/"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Library className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-blue-400" />
                      Início
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/catalogo"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-blue-400" />
                      Catálogo
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/perfil"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-blue-400" />
                      Meu Perfil
                    </Link>
                  </li>
                </>
              ) : (
                // Links para usuários não autenticados
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-blue-400" />
                      Fazer Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/registro"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-blue-400" />
                      Criar Conta
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/recuperar-senha"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-blue-400" />
                      Recuperar Senha
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">Contato</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                <span>(91) 3210-8000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0" />
                <span className="break-all">biblioteca@cesupa.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Av. Alcindo Cacela, 287 - Belém/PA</span>
              </li>
            </ul>
          </div>

          {/* Horário de Funcionamento / Sobre o Sistema */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-white text-sm sm:text-base">
              {user ? "Horário de Funcionamento" : "Sobre o Sistema"}
            </h3>
            {user ? (
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li>Segunda a Sexta: 7h às 22h</li>
                <li>Sábado: 8h às 17h</li>
                <li>Domingo: Fechado</li>
              </ul>
            ) : (
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li>• Acesso ao catálogo digital</li>
                <li>• Empréstimos online</li>
                <li>• Renovação automática</li>
                <li>• Histórico de leituras</li>
                <li>• Reservas de livros</li>
                <li>• Suporte 24/7</li>
              </ul>
            )}
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                {user ? "Sistema v1.0 - Desenvolvido para CESUPA" : "Plataforma segura e confiável"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-6 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} CESUPA - Centro Universitário do Estado do Pará. Todos os direitos reservados.
          </p>
          {!user && (
            <p className="text-gray-500 text-xs mt-2">
              Sistema de Gestão Bibliotecária - Acesso restrito a membros da comunidade acadêmica
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
