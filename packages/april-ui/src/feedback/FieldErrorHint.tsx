'use client';

import { FC, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface FieldErrorHintProps {
    /** Текст ошибки; null/пустая строка — ничего не рендерится. */
    error?: string | null;
    className?: string;
}

/**
 * Ошибка поля пузырём НАД строкой, вне потока.
 *
 * Инлайновый `<span>` в конце flex-ряда при появлении переносил строку и
 * распирал шапку — особенно больно в compact-редакторах, живущих прямо в
 * строке шапки (ИНН, сигналы). Absolute-позиция гарантирует: вёрстка ряда
 * не меняется от появления и исчезновения ошибки.
 *
 * Если над строкой места нет (редактор — первая строка фрейма: шапка списка
 * дел), пузырь автоматически перекидывается ВНИЗ — иначе он рисовался бы за
 * верхней границей iframe и «Сохранить» выглядел бы безответным.
 *
 * Родитель обязан быть `relative` — компонент позиционируется от него.
 */
export const FieldErrorHint: FC<FieldErrorHintProps> = ({
    error,
    className,
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    useLayoutEffect(() => {
        if (!error) {
            setIsFlipped(false);
            return;
        }
        const rect = ref.current?.getBoundingClientRect();
        if (rect && rect.top < 0) setIsFlipped(true);
    }, [error]);

    if (!error) return null;

    return (
        <span
            ref={ref}
            role="alert"
            className={cn(
                'absolute left-0 z-10 max-w-72 rounded-md border border-destructive/30 bg-popover px-2 py-1 text-xs leading-snug text-destructive shadow-md',
                isFlipped ? 'top-full mt-1' : 'bottom-full mb-1',
                className,
            )}
        >
            {error}
        </span>
    );
};
