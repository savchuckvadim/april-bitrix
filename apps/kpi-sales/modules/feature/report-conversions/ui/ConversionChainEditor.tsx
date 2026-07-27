'use client';

import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GlassSurface } from '@workspace/april-ui';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import type { RatingAction } from '@/modules/feature/report-rating';
import { DEFAULT_CONVERSION_CHAIN } from '../lib/conversion-catalog';

interface ConversionChainEditorProps {
    /** Показатели датасета (уже отфильтрованные). */
    actions: RatingAction[];
    /** Упорядоченная цепочка выбранных кодов. */
    codes: string[];
    onChange: (codes: string[]) => void;
}

/**
 * Редактор цепочки конверсии: доступные показатели — badge-тогглы,
 * выбранные — упорядоченные чипы с перемещением вверх/вниз и удалением.
 */
export const ConversionChainEditor: React.FC<ConversionChainEditorProps> = ({
    actions,
    codes,
    onChange,
}) => {
    const known = codes.filter(code =>
        actions.some(action => action.code === code),
    );
    const available = actions.filter(action => !known.includes(action.code));
    const nameOf = (code: string) =>
        actions.find(action => action.code === code)?.name || code;

    const reduceMotion = useReducedMotion();
    const move = (index: number, delta: number) => {
        const next = [...known];
        const target = index + delta;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target]!, next[index]!];
        onChange(next);
    };

    // Дефолтная цепочка в рамках доступных показателей
    const defaultChain = DEFAULT_CONVERSION_CHAIN.filter(code =>
        actions.some(action => action.code === code),
    );
    const isDefaultChain =
        known.length === defaultChain.length &&
        known.every((code, i) => code === defaultChain[i]);

    return (
        <div className="space-y-3">
            <div>
                <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">
                        Цепочка конверсии (порядок важен)
                    </Label>
                    {!isDefaultChain && defaultChain.length >= 2 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 cursor-pointer gap-1 px-1.5 text-[11px] text-muted-foreground"
                            title="Вернуть цепочку по умолчанию"
                            onClick={() => onChange(defaultChain)}
                        >
                            <RotateCcw className="h-3 w-3" />
                            Сбросить порядок
                        </Button>
                    )}
                </div>
                {known.length ? (
                    // «Жидкое стекло» под чипами (GlassSurface — SVG-рефракция
                    // в Chromium, april-glass фолбэк в Safari/FF); перемещение
                    // ←/→ и добавление/удаление анимируются framer-motion.
                    <GlassSurface
                        borderRadius={12}
                        // contain:layout изолирует reflow чипов от родителя —
                        // вёрстка ниже не «скачет»; min-h держит высоту стабильной
                        className="mt-2 min-h-[3.25rem] p-2 [contain:layout]"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <AnimatePresence initial={false}>
                                {known.map((code, index) => (
                                    <motion.span
                                        key={code}
                                        // только position — чипы скользят, размер
                                        // не анимируется (не тянет высоту строки)
                                        layout={reduceMotion ? false : 'position'}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                            damping: 32,
                                        }}
                                        className="flex items-center gap-1 rounded-md border border-white/20 bg-secondary/70 px-2 py-1 text-xs text-secondary-foreground backdrop-blur-sm"
                                    >
                                        <span className="text-muted-foreground">
                                            {index + 1}.
                                        </span>
                                        {nameOf(code)}
                                        {/* Чипы горизонтальные — стрелки тоже:
                                            ← раньше по цепочке, → позже */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            title="Сдвинуть раньше по цепочке"
                                            disabled={index === 0}
                                            onClick={() => move(index, -1)}
                                        >
                                            <ChevronLeft className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0"
                                            title="Сдвинуть позже по цепочке"
                                            disabled={index === known.length - 1}
                                            onClick={() => move(index, 1)}
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-5 w-5 p-0 text-destructive"
                                            onClick={() =>
                                                onChange(
                                                    known.filter(
                                                        c => c !== code,
                                                    ),
                                                )
                                            }
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    </GlassSurface>
                ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Выберите минимум два показателя ниже
                    </p>
                )}
                {known.length === 1 && (
                    <p className="mt-1 text-xs text-warning">
                        Для расчёта конверсии нужен ещё хотя бы один показатель
                    </p>
                )}
            </div>
            {available.length > 0 && (
                <div>
                    <Label className="text-xs text-muted-foreground">
                        Доступные показатели
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2 [contain:layout]">
                        <AnimatePresence initial={false}>
                            {available.map(action => (
                                <motion.span
                                    key={action.code}
                                    layout={reduceMotion ? false : 'position'}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 32,
                                    }}
                                >
                                    <Badge
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() =>
                                            onChange([...known, action.code])
                                        }
                                    >
                                        {action.name}
                                    </Badge>
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};
