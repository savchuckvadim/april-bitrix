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
 *
 * `align` выбирают по месту кнопки в шапке: 'end' — панель прижата к правому
 * краю кнопки (тогглер в правом конце строки), 'start' — к левому, панель
 * растёт вправо (тогглер у левого края, иначе она уезжает за экран).
 *
 * Весь набор — тема, цвет, масштаб — прячется под язычком вместе: в свёрнутом
 * виде строка занимает одну иконку (инлайновые проценты пробовали — шапку
 * распирало, откатили).
 */
export const ThemeTogglePanel = ({
    withScale = true,
    align = 'end',
}: {
    withScale?: boolean;
    align?: 'start' | 'end';
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
                        className={`absolute top-full z-50 mt-1 flex flex-row items-center gap-1.5 rounded-lg border border-border bg-popover px-2 shadow-md ${
                            align === 'end' ? 'right-0' : 'left-0'
                        }`}
                    >
                        <ThemeToggler pickerAlign={align} />
                        {withScale && <ScaleToggler />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
