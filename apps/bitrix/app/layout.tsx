import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import Head from "next/head"

// import { LoadingScreen } from "@/modules/general"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <style>{`
            html::before {
              background-size: 150px !important;
              opacity: 1;
              content: "";
              display: block;
              position: fixed;
              z-index: 999;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: url("/logo-animate.svg") no-repeat center, #fff;
              transition: opacity 0.3s ease-in;
            }
                    
            html.loaded::before {
              opacity: 0;
              pointer-events: none;
            }
            #global-loader {
              position: fixed;
              inset: 0;
              background: white;
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: sans-serif;
              font-size: 18px;
              transition: opacity 0.3s ease;
            }
            #global-loader.fade {
              opacity: 0;
              pointer-events: none;
            }
          `}</style>
      </Head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <div id="global-loader">
          Загрузка...
        </div>
        <Providers>
          {/* <LoadingScreen /> */}
          {children}
          <script dangerouslySetInnerHTML={{ __html: removeLoaderScript }} />
        </Providers>
      </body>
    </html>
  )
}
const removeLoaderScript = `
  window.addEventListener('DOMContentLoaded', function () {
    const loader = document.getElementById('global-loader');
    if (loader) loader.remove();
  });
`