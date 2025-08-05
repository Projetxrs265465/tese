interface ChatImageProps {
  src: string
  alt: string
  className?: string
}

export function ChatImage({ src, alt, className = "" }: ChatImageProps) {
  return (
    <div className={`my-2 ${className}`}>
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="max-w-full h-auto rounded-lg shadow-sm"
        loading="lazy"
      />
    </div>
  )
}
