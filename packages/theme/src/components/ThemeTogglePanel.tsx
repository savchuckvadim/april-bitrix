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
 *
 * Уровня два намеренно: в панели — луна, ТОЧКА текущего цвета и масштаб;
 * вся палитра выезжает отдельно, по нажатию на точку (см. ColorSchemePicker).
 * Показывать все схемы сразу пробовали — панель распухала и читалась кашей.
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
        // Компактный паддинг: 16px со всех сторон под 16px иконку распирали
        // шапку сильнее самих кнопок-соседей.
        <div ref={ref} className="relative flex flex-row items-center p-1">
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
                aria-label="Настройки вида"
                className="px-0 py-1 rounded-full cursor-pointer text-muted-foreground hover:bg-accent transition"
            >
                {/* Стрелка разворачивается вниз — и это видно: без duration
                    поворот проскакивал незаметно. */}
                <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        // w-max: панель абсолютная, а контейнинг-блок у неё
                        // шириной в иконку — без этого содержимое ужималось
                        // по ширине и квадратики налезали друг на друга.
                        className={`absolute top-full z-50 mt-1 flex w-max flex-row items-center gap-2 rounded-lg border border-border bg-popover px-2 py-1.5 shadow-md ${
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
