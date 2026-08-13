'use client';

import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useColorSchemePicker } from '../hook/useColorSchemePicker';
import { COLOR_SCHEME_OPTIONS } from '../lib/constants/color-schemes';

export const ColorSchemePicker = () => {
    const { scheme, open, ref, toggle, selectScheme } = useColorSchemePicker();

    return (
        <div className="relative" ref={ref}>
            <button
                className="cursor-pointer hover:text-primary text-foreground p-2 rounded-md hover:bg-muted transition"
                onClick={toggle}
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
                        className="absolute right-30 z-50 mt-2 p-2 bg-popover rounded-lg border border-border shadow-lg grid grid-cols-4 gap-1.5"
                    >
                        {COLOR_SCHEME_OPTIONS.map(({ value, color }) => (
                            <button
                                key={value}
                                className={`cursor-pointer h-5 w-5 rounded-md border border-border transition hover:scale-110 ${
                                    scheme === value
                                        ? 'ring-2 ring-foreground ring-offset-1 ring-offset-popover'
                                        : ''
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => selectScheme(value)}
                                aria-label={`Выбрать цветовую схему ${value}`}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
