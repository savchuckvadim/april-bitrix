import { ColorContext } from "../provider/Theme";
import { useContext } from "react";


export const useColorScheme = () => {
    const ctx = useContext(ColorContext);
    if (!ctx) throw new Error("useColorScheme must be used within CustomThemeProvider");
    return ctx;
};
