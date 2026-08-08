'use client';

import { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggler } from './ThemeToggler';
import { ScaleToggler } from './ScaleToggler';
import { useOutsideClick } from '../hook/useOutsideClick';

/**
 * Складной «язычок» управления видом: light/dark, цветовая схема, масштаб.
 * В свёрнутом виде занимает одну иконку — безопасен для компактных placement'ов.
 *
 * Раскрытие — оверлеем под кнопкой, а не инлайном: раскрытые тогглеры в
 * строке шапки распихивали соседей, и вся шапка прыгала.
 */
export const ThemeTogglePanel = ({
    withScale = true,
}: {
    withScale?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOutsideClick(ref, () => setIsOpen(false));

    return (
        <div ref={ref} className="relative flex flex-row items-center p-4">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
                aria-label="Настройки вида"
                className="px-0 py-1 rounded-full cursor-pointer text-muted-foreground hover:bg-accent transition"
            >
                <ChevronRight
                    size={16}
                    className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full z-50 mt-1 flex flex-row items-center gap-1.5 rounded-lg border border-border bg-popover px-2 shadow-md"
                    >
                        <ThemeToggler />
                        {withScale && <ScaleToggler />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
