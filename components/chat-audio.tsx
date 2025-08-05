"use client"

import { useEffect, useRef } from "react"
import { Volume2 } from "lucide-react"

interface ChatAudioProps {
  src: string
  autoPlay?: boolean
}

export function ChatAudio({ src, autoPlay = false }: ChatAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [autoPlay])

  return (
    <div className="my-2 flex items-center gap-2 bg-gray-100 rounded-lg p-3">
      <Volume2 className="w-4 h-4 text-gray-600" />
      <audio ref={audioRef} controls className="flex-1">
        <source src={src} type="audio/mpeg" />
        Seu navegador não suporta o elemento de áudio.
      </audio>
    </div>
  )
}
