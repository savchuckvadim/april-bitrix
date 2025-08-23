"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "@/modules/app/model/store";
import { ApiProvider } from "./api-provider";
import { AprilThemeProvider } from "@workspace/theme";

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
          <ApiProvider>{children}</ApiProvider>
        </AprilThemeProvider>
      </NextThemesProvider>
    </Provider>
  );
}
