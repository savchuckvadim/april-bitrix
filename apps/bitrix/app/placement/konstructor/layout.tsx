// import { Geist, Geist_Mono } from "next/font/google"

// import "@workspace/ui/globals.css"
// import { Providers } from "@/components/providers"

'use server'
export default async function KonstructorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (

    <>
      <div id="global-loader">
        <style>{`
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
        <div>Загрузка приложения...</div>
      </div>
      <>
        {children}
      </>
    </>
  )
}
