interface ChatVideoProps {
  embedUrl: string
  title?: string
  autoPlay?: boolean
  preload?: boolean
}

export function ChatVideo({ embedUrl, title = "Video", autoPlay = false, preload = false }: ChatVideoProps) {
  // Add autoplay parameter to YouTube URLs
  const getEmbedUrl = (url: string, autoPlay: boolean) => {
    if (autoPlay && url.includes("youtube.com")) {
      const separator = url.includes("?") ? "&" : "?"
      return `${url}${separator}autoplay=1&mute=1&rel=0&modestbranding=1`
    }
    return url
  }

  if (preload) {
    // Preload version - hidden iframe to cache the video
    return (
      <div style={{ display: "none" }}>
        <iframe
          src={getEmbedUrl(embedUrl, false)}
          title={`${title} - preload`}
          width="1"
          height="1"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    )
  }

  return (
    <div className="my-3">
      <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-lg" style={{ paddingBottom: "75%" }}>
        {/* Increased from 56.25% to 75% for larger video */}
        <iframe
          src={getEmbedUrl(embedUrl, autoPlay)}
          title={title}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">📺 Vídeo informativo - Feirão Limpa Nome Serasa</div>
    </div>
  )
}
