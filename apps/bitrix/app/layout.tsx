import { Geist, Geist_Mono } from "next/font/google"
import "@workspace/ui/globals.css"
import "@workspace/theme/themes.css"
import { Providers } from "@/components/providers"
import { LoadingScreen } from "@/modules/general"

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
   
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
      <LoadingScreen />
        <Providers>
    
          {children}

        </Providers>
      </body>
    </html>
  )
}
