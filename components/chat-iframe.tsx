interface ChatIframeProps {
  src: string
  height?: number
  title?: string
}

export function ChatIframe({ src, height = 400, title = "Embedded content" }: ChatIframeProps) {
  return (
    <div className="my-2">
      <iframe
        src={src}
        title={title}
        className="w-full rounded-lg border"
        style={{ height: `${height}px` }}
        frameBorder="0"
      />
    </div>
  )
}
