'use client';
import { useThemeToggler } from '../hook/useThemeToggler';
import { MoonStar, SunDim } from 'lucide-react';
import { ColorSchemePicker } from './ColorSchemePicker';

export const ThemeToggler = () => {
    const { currentTheme, toggle, mounted, isSpinning } = useThemeToggler();

    if (!mounted) {
        return (
            <div className="flex items-center gap-1 text-foreground">
                <div className="w-5 h-5" />
                <ColorSchemePicker />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-foreground">
            <button
                onClick={toggle}
                className="hover:text-primary cursor-pointer transition-transform duration-300 hover:scale-110"
                aria-label="Переключить тему"
            >
                {currentTheme === 'dark' ? (
                    <MoonStar
                        size={20}
                        className={`transition-all duration-50 ${
                            isSpinning ? 'animate-spin' : ''
                        }`}
                    />
                ) : (
                    <SunDim
                        size={20}
                        className={`transition-all duration-50 ${
                            isSpinning ? 'animate-spin' : ''
                        }`}
                    />
                )}
            </button>

            <ColorSchemePicker />
        </div>
    );
};
