import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Gestão de Biblioteca CESUPA",
  description: "Sistema completo para gestão de biblioteca universitária",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Header />
              <main className="flex-1 w-full">
                <div className="w-full max-w-[2000px] mx-auto">{children}</div>
              </main>
              <Footer />
            </div>
          </AuthGuard>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
