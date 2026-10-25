'use client';

import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { EntityLinkText } from './EntityLinkText';

export interface EntityTitleProps {
    title: string;
    /** Ссылка на карточку CRM; null — без ссылки. */
    href: string | null;
    /** Тип сущности мелко под названием: «Компания», «Сделка», «Лид». */
    kindLabel: string;
    /** Справа от названия: ответственный, номер сделки. */
    meta?: ReactNode;
    /** `lg` — крупное название для высокой шапки широких экранов. */
    size?: 'md' | 'lg';
}

/**
 * Кто открыт: название-ссылка на карточку CRM, под ним — тип сущности, справа
 * мета (ответственный и т.п.). Общая шапка «Звонков» и конструктора.
 *
 * Тип подписан мелким текстом снизу, а не бэйджем перед названием: бэйдж
 * занимал место в самой заметной строке экрана и спорил с названием за
 * внимание, хотя отвечает на второстепенный вопрос. Название ограничено по
 * ширине — длинные имена не распирают шапку, полное видно по наведению.
 */
export const EntityTitle = ({
    title,
    href,
    kindLabel,
    meta,
    size = 'md',
}: EntityTitleProps) => {
    const isLarge = size === 'lg';

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span
                className={cn(
                    'flex min-w-0 flex-col',
                    isLarge ? 'max-w-[36rem]' : 'max-w-72',
                )}
            >
                <h1
                    className={cn(
                        'flex min-w-0 leading-tight font-semibold text-foreground',
                        isLarge ? 'text-2xl' : 'text-lg',
                    )}
                >
                    <EntityLinkText title={title} href={href} />
                </h1>
                <span className="text-[0.625rem] leading-none tracking-wide text-muted-foreground uppercase">
                    {kindLabel}
                </span>
            </span>

            {meta ? (
                <span className="shrink-0 text-sm text-muted-foreground">
                    {meta}
                </span>
            ) : null}
        </div>
    );
};
