'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentRelations } from '@/modules/entities/RelatedCrm';
import { EVENT_ROUTE_PATH, ROUTE_EVENT } from '@/modules/processes/event';
import { useEntityWarnings } from '../lib/hooks/use-entity-warnings';
import { useEntityWarningHandlers } from '../lib/hooks/use-entity-warning-handlers';
import { EntityActions } from './EntityActions';
import { EntityBar } from './EntityBar';
import { EntityEventRow } from './EntityEventRow';
import { EntityIdentity } from './EntityIdentity';
import { EntityWarnings } from './EntityWarnings';

/**
 * ОСНОВНАЯ шапка приложения — единственный экземпляр над роут-слотом (в App).
 *
 * Порядок строк — решение владельца: сначала все названия (кто открыт) и
 * предупреждения, под ними градиенты стадий, ниже — текущее дело, когда мы в
 * нём. Своих шапок у экранов больше нет: раньше шапка дела дублировала
 * клиента вторым этажом, а при переключениях обе перерисовывались.
 *
 * Экраны переключаются нативным роутингом, и всё внутри роут-слота
 * пересоздаётся; шапка живёт снаружи, поэтому при переходах список ↔ дело
 * её DOM не трогается — ничего не мигает и не перемеряется.
 */
export const EntityHeader: FC = () => {
    const pathname = usePathname();
    const { descriptor } = useCurrentRelations();
    const warnings = useEntityWarnings();
    const handlers = useEntityWarningHandlers();

    // Финиш — прощальный экран без работы с клиентом.
    if (pathname === EVENT_ROUTE_PATH[ROUTE_EVENT.FINISH]) return null;

    /** Клиент определился: есть кого назвать и чьи связи показывать. */
    const withEntity = Boolean(descriptor);
    /** Мы внутри дела: к шапке добавляется строка текущего события. */
    const withCurrentEvent = pathname === EVENT_ROUTE_PATH[ROUTE_EVENT.ITEM];

    return (
        <header className="z-20 shrink-0 bg-background/80 backdrop-blur-sm">
            <div className="space-y-1 px-3 py-1.5">
                {/* Названия и предупреждения — ОДНОЙ строкой: предупреждения
                    идут сразу за названиями, действия прижаты к правому
                    верхнему углу. Действия рисуются ВСЕГДА: во встройке без
                    компании, лида и сделки (звонок с неизвестного номера)
                    «обновить» — единственный способ переинициализировать
                    приложение, и прятать его вместе с именем клиента нельзя. */}
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    {withEntity && <EntityIdentity />}
                    <EntityWarnings warnings={warnings} handlers={handlers} />
                    <EntityActions />
                </div>

                {withEntity && <EntityBar />}
                {withCurrentEvent && <EntityEventRow />}
            </div>
        </header>
    );
};
