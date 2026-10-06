'use client';

import { FC, ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    isLazySectionOpened,
    markLazySectionOpened,
} from './lazy-section-registry';

interface LazySectionProps {
    /** Ключ секции в памяти фрейма: раскрытая не схлопывается при переходах. */
    id: string;
    title: string;
    /** Что внутри — одной строкой под названием. */
    hint?: string;
    children: ReactNode;
}

/**
 * Секция «по требованию»: до клика — строка с названием, содержимое не
 * смонтировано и ничего не запрашивает.
 *
 * Зачем (владелец, 05.10.2026): фрейм открывают на каждый звонок, а история,
 * пересечения, ИНН и контакты грузились сразу — десятки запросов в Битрикс
 * на каждое открытие при лимите портала 2 запроса в секунду. Смотрят эти
 * блоки единицы, поэтому платит за них теперь только тот, кто открыл.
 *
 * Свёрнутая `SectionCard` тут не годится: хуки тяжёлого блока стоят в теле
 * компонента и отработали бы при монтировании, даже со свёрнутым контентом.
 */
export const LazySection: FC<LazySectionProps> = ({
    id,
    title,
    hint,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(() => isLazySectionOpened(id));

    if (isOpen) return <>{children}</>;

    const open = () => {
        markLazySectionOpened(id);
        setIsOpen(true);
    };

    return (
        <button
            type="button"
            aria-expanded={false}
            onClick={open}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted"
        >
            <span className="min-w-0">
                <span className="block text-sm font-semibold">{title}</span>
                {hint && (
                    <span className="block truncate text-xs text-muted-foreground">
                        {hint}
                    </span>
                )}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                Показать
                <ChevronDown aria-hidden className="size-4" />
            </span>
        </button>
    );
};
