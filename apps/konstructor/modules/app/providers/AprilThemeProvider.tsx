import { AprilThemeProvider as AprilThemeProviderRoot } from "@workspace/april-theme";
import {
    ThemeProvider as NextThemesProvider,
    useTheme as useNextTheme,
} from 'next-themes';

export function AprilThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { theme, resolvedTheme, setTheme } = useNextTheme();

    return (
        <AprilThemeProviderRoot
            theme={theme}
            resolvedTheme={resolvedTheme}
            setTheme={setTheme}
        >
            {children}
        </AprilThemeProviderRoot>
        );
    }
