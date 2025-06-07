"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Provider } from 'react-redux'
import { store } from '@/modules/app/model/store'
import { ApiProvider } from './api-provider'
import { AprilThemeProvider } from "@workspace/theme"
import App from "@/modules/app/ui/App"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <AprilThemeProvider>
          <ApiProvider>
            <App inBitrix={false} envBitrix={false} isPublic={true}  >
              {children}
            </App>
          </ApiProvider>
        </AprilThemeProvider>
      </NextThemesProvider>
    </Provider>
  )
}
