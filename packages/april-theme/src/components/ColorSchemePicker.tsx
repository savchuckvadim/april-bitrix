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
                        className="absolute right-30 z-50 mt-2 w-48 p-4 bg-popover rounded-md shadow-lg grid grid-cols-4 gap-2"
                    >
                        {COLOR_SCHEME_OPTIONS.map(({ value, color }) => (
                            <button
                                key={value}
                                className={`cursor-pointer w-8 h-8 rounded-full border-2 ${
                                    scheme === value
                                        ? 'ring-2 ring-foreground'
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
