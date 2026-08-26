'use client';

import { FC } from 'react';
import { usePathname } from 'next/navigation';
import { ClientBar } from '@/modules/entities/EventCompany';
import { useCurrentRelations } from '@/modules/entities/RelatedCrm';
import { InnControl } from '@/modules/features/Inn';
import { EVENT_ROUTE_PATH, ROUTE_EVENT } from '@/modules/processes/event';
import { useUiDensity } from '@/modules/app/lib/hooks/use-ui-density';
import { useEntityWarnings } from '../lib/hooks/use-entity-warnings';
import { useEntityWarningHandlers } from '../lib/hooks/use-entity-warning-handlers';
import { useRelationNoticeWarnings } from '../lib/hooks/use-relation-notice-warnings';
import { EntityActions } from './EntityActions';
import { EntityBar } from './EntityBar';
import { EntityEventRow } from './EntityEventRow';
import { EntityIdentity } from './EntityIdentity';
import { EntityWarningsFloat } from './EntityWarningsFloat';

/**
 * ИНН-предупреждения из шапки убраны (todo2508 №6): их роль — эхо пустого
 * InnControl (`echoWhenEmpty`) и модалка «Поля сущности». Остальные
 * (нет компании, лид не сконвертирован, пустое название) — всплывашкой
 * у названия (EntityWarningsFloat).
 */
const HEADER_HIDDEN_WARNING_IDS = new Set(['company-inn', 'deal-inn']);

/**
 * ОСНОВНАЯ шапка приложения — единственный экземпляр над роут-слотом (в App).
 *
 * Два режима, и развилка — ПЛЕЙСМЕНТ, не ширина окна (уточнение владельца,
 * todo2508 №6): «большой дисплей» — это полноэкранные встройки (таймлайн,
 * вкладка задачи), «маленький» — компактные (вкладка карточки CRM ~630×600,
 * карточка звонка). Критерий общий со страницами — isWideDisplay
 * (use-ui-density), борд и высокий хедер включаются вместе.
 *
 *  - ШИРОКИЙ: высокий хедер — крупное название, рядом прогноз/статус
 *    компании и ИНН (переехали из клиентской строки), всплывашка
 *    предупреждений, ниже строка воронки и полная строка текущего дела;
 *  - УЗКИЙ: максимально ужат — одна строка: ужатая event-строка
 *    (стрелка + название дела) + кнопки действий. Клиентские строки не
 *    рендерятся вовсе.
 *
 * Действия (EntityActions) — ОДИН инстанс на оба режима: DepartmentMode и
 * ThemeTogglePanel стейтовые, дублировать их нельзя.
 *
 * Экраны переключаются нативным роутингом; шапка живёт снаружи роут-слота,
 * при переходах список ↔ дело её DOM не трогается.
 */
export const EntityHeader: FC = () => {
    const pathname = usePathname();
    const { descriptor } = useCurrentRelations();
    const { isWideDisplay } = useUiDensity();
    // Хинты о выборе главной сделки (автопереключение на свою открытую /
    // чужая открытая) — той же всплывашкой, ПОСЛЕ предупреждений клиента:
    // те отсортированы blocking-первыми, а хинты никогда не блокируют.
    const warnings = [
        ...useEntityWarnings().filter(
            warning => !HEADER_HIDDEN_WARNING_IDS.has(warning.id),
        ),
        ...useRelationNoticeWarnings(),
    ];
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
                {/* Ряд 1: контент зависит от режима, действия рисуются
                    ВСЕГДА — во встройке без сущностей «обновить» —
                    единственный способ переинициализировать приложение. */}
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                    {isWideDisplay && withEntity && (
                        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
                            <EntityIdentity size="lg" />
                            <EntityWarningsFloat
                                warnings={warnings}
                                handlers={handlers}
                            />
                            {/* Прогноз/статус компании — из клиентской строки
                                в высокий хедер, после названия. */}
                            <ClientBar className="min-w-50" />
                            <InnControl echoWhenEmpty />
                        </div>
                    )}

                    {/* Узкий режим: ужатая event-строка живёт прямо в
                        микрохедере — отдельная строка не тратится. */}
                    {!isWideDisplay && withCurrentEvent && (
                        <div className="min-w-0 flex-1">
                            <EntityEventRow variant="inline" />
                        </div>
                    )}

                    <EntityActions />
                </div>

                {isWideDisplay && withEntity && <EntityBar />}
                {isWideDisplay && withCurrentEvent && <EntityEventRow />}
            </div>
        </header>
    );
};
