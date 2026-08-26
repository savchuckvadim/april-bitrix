'use client';

import { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { EntityLink, useCurrentRelations } from '@/modules/entities/RelatedCrm';

/**
 * Кто открыт: название-ссылка на карточку CRM, под ним — тип сущности, справа
 * ответственный.
 *
 * Тип подписан мелким текстом снизу, а не бэйджем перед названием: бэйдж
 * занимал место в самой заметной строке экрана и спорил с названием за
 * внимание, хотя отвечает на второстепенный вопрос. Название ограничено по
 * ширине — длинные имена (лидоген генерит простыни) не распирают шапку,
 * полное видно по наведению.
 */
interface EntityIdentityProps {
    /**
     * `lg` — крупное название для высокого хедера широких экранов
     * (todo2508 №6); `md` — прежний размер.
     */
    size?: 'md' | 'lg';
}

export const EntityIdentity: FC<EntityIdentityProps> = ({ size = 'md' }) => {
    const { descriptor, details } = useCurrentRelations();
    if (!descriptor) return null;

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
                    <EntityLink descriptor={descriptor} />
                </h1>
                <span className="text-[0.625rem] leading-none tracking-wide text-muted-foreground uppercase">
                    {descriptor.kindLabel}
                </span>
            </span>

            {details?.responsible?.name && (
                <span className="shrink-0 text-sm text-muted-foreground">
                    {details.responsible.name}
                </span>
            )}
        </div>
    );
};
