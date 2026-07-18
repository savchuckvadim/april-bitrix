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
        <div ref={ref} className="relative flex flex-row items-center">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="px-0 py-1 rounded-full cursor-pointer text-muted-foreground hover:bg-accent transition"
            >
                <ChevronRight
                    size={18}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-row items-center gap-2 mx-2"
                    >
                        <ThemeToggler />
                        {withScale && <ScaleToggler />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
