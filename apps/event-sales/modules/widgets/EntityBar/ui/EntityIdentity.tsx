'use client';

import { FC } from 'react';
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
export const EntityIdentity: FC = () => {
    const { descriptor, details } = useCurrentRelations();
    if (!descriptor) return null;

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex min-w-0 max-w-72 flex-col">
                <h1 className="flex min-w-0 text-lg leading-tight font-semibold text-foreground">
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
