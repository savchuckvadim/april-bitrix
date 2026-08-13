'use client';

import { useState, useRef } from 'react';
import { Palette } from 'lucide-react';
import { useColorScheme } from '../hook/useColorScheme';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutsideClick } from '../hook/useOutsideClick';
import { ColorScheme } from '../provider/Theme';

const schemeList = [
    { value: 'default', color: '#1E293B' },
    { value: 'blue', color: '#3B82F6' },
    { value: 'violet', color: '#8B5CF6' },
    { value: 'pink', color: '#d6409f' },
    { value: 'red', color: '#EF4444' },
    { value: 'orange', color: '#f76b15' },
    { value: 'yellow', color: '#ffc53d' },
    { value: 'green', color: '#46a758' },
    { value: 'bx', color: '#30c3ef' },
    { value: 'beige', color: '#F5F3F0' },
    { value: 'explosive-pink', color: '#bb52d4' },
    { value: 'air', color: '#3773e0' },
    { value: 'claude', color: '#D97757' },
];

/**
 * Сетка маленьких скруглённых квадратиков-свотчей.
 * `align` — к какому краю кнопки прижат дропдаун: 'start' растёт вправо
 * (кнопка у левого края экрана), 'end' — влево (кнопка у правого).
 */
export const ColorSchemePicker = ({
    align = 'start',
}: {
    align?: 'start' | 'end';
}) => {
    const { scheme, setScheme } = useColorScheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useOutsideClick(ref, () => setOpen(false));

    return (
        <div className="relative" ref={ref}>
            <button
                className="cursor-pointer text-foreground p-2 rounded-md hover:bg-muted transition"
                onClick={() => setOpen(!open)}
                title="Выбрать цветовую схему"
            >
                <Palette size={20} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-full z-50 mt-1 grid grid-cols-4 gap-1.5 rounded-lg border border-border bg-popover p-2 shadow-lg ${
                            align === 'end' ? 'right-0' : 'left-0'
                        }`}
                    >
                        {schemeList.map(({ value, color }) => (
                            <button
                                key={value}
                                className={`cursor-pointer h-5 w-5 rounded-md border border-border transition hover:scale-110 ${
                                    scheme === value
                                        ? 'ring-2 ring-foreground ring-offset-1 ring-offset-popover'
                                        : ''
                                }`}
                                style={{ backgroundColor: color }}
                                title={value}
                                aria-label={`Цветовая схема ${value}`}
                                onClick={() => {
                                    setScheme(value as ColorScheme);
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
