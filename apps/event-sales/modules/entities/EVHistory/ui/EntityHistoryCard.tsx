'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { cn } from '@workspace/ui/lib/utils';
import { SectionState } from '@/modules/shared/SectionState';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { loadEventSalesHistory } from '../model/EVHistoryThunk';
import { useLazyReveal } from '../lib/hooks/use-lazy-reveal';
import { usePortalHistory } from '../lib/hooks/use-portal-history';
import {
    EHistoryViewMode,
    HistoryViewMode,
    useHistoryView,
} from '../lib/hooks/use-history-view';
import { useEnsureUsers } from '@/modules/entities/BitrixUser';
import { useHistoryResponsible } from '../lib/hooks/use-history-responsible';
import { useHistoryStatus } from '../lib/hooks/use-history-status';
import { HistoryGroupSection } from './HistoryGroupSection';
import { HistoryRecordRow } from './HistoryRecordRow';

/** История из полей сущности — когда портального списка нет. */
const FallbackHistory: FC<{ items: string[] }> = ({ items }) => {
    if (!items.length) {
        return (
            <p className="text-sm text-muted-foreground">
                Список «ОП История» не установлен на портале, и в полях клиента
                записей нет.
            </p>
        );
    }

    return (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {items.map((item, index) => (
                <li
                    key={`${index}-${item.slice(0, 24)}`}
                    className="border-l-2 border-border pl-2 text-sm leading-relaxed text-muted-foreground"
                >
                    {item}
                </li>
            ))}
        </ul>
    );
};

/**
 * История работы по клиенту из портального списка «ОП История» — по ВСЕМ
 * привязкам контекста (компания, сделки, лиды, контакты), а не только по
 * компании: присоединённые лиды несут свою богатую историю.
 *
 * Грузится ЛЕНИВО — когда раскрытая секция впервые попала во вьюпорт
 * (use-lazy-reveal): свёрнутая или не доскроленная карточка не грузит
 * ничего, вместе с ней молчит и дозапрос имён авторов (useEnsureUsers).
 * На широких экранах историю обычно уже заказал бейдж презентаций в шапке
 * (usePresentationCount) — карточка тогда читает готовое, второй запрос
 * гасят status-гварды thunk'а. Дальше
 * первые 50 записей каждой ленты — одним batch'ем, потом скролл-догрузка
 * конкретной ленты. Группировка переключается: «по сущностям» (повторы
 * схлопываются в первую группу) или «по датам» (единая лента, свежие сверху).
 *
 * Если списка на портале нет, показываем поля самой сущности
 * (`op_history` / `op_mhistory`) — беднее, но лучше пустого экрана.
 */
interface EntityHistoryCardProps {
    /**
     * Растянуться на всю высоту родителя. Включать ТОЛЬКО там, где родитель
     * эту высоту задаёт (вкладка «История»). В колонке с прокруткой flex-1
     * без basis схлопывает карточку в ноль — и получается «История (5)» с
     * пустым телом.
     */
    fill?: boolean;
}

export const EntityHistoryCard: FC<EntityHistoryCardProps> = ({
    fill = false,
}) => {
    const dispatch = useAppDispatch();
    const view = useHistoryView();
    const resolveResponsible = useHistoryResponsible();
    const resolveStatus = useHistoryStatus();
    const fallback = usePortalHistory();

    // Имена авторов записей: кто вне отдела продаж — доспрашиваем у портала,
    // иначе история подписывается «Сотрудник 447». До загрузки истории
    // записей нет — хук молчит, то есть лениво вместе с самой историей.
    useEnsureUsers(view.dateRecords.map(record => record.responsibleId));

    // Ref на контент карточки: свёрнутая секция контент не монтирует, поэтому
    // загрузка стартует ровно при первом ПОКАЗЕ — раскрытой и во вьюпорте.
    const attachReveal = useLazyReveal(() => {
        dispatch(loadEventSalesHistory());
    });

    return (
        // Свёртка выключена в fill-режиме: там карточка ЗАДАЁТ высоту вкладки,
        // и схлопывание оставило бы пустой экран.
        <SectionCard
            title={`История${
                view.status === 'ready' && !view.isListMissing
                    ? ` (${view.dateRecords.length})`
                    : ''
            }`}
            collapsible={!fill}
            defaultOpen
            className={cn('flex flex-col', fill && 'h-full min-h-0 flex-1')}
            contentClassName={cn('flex flex-col', fill && 'min-h-0 flex-1')}
            actions={
                view.isListMissing ? (
                    fallback.items.length > 0 ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            из полей клиента
                        </span>
                    ) : undefined
                ) : (
                    <Tabs
                        value={view.mode}
                        onValueChange={value =>
                            view.setMode(value as HistoryViewMode)
                        }
                    >
                        <TabsList className="h-7">
                            <TabsTrigger
                                value={EHistoryViewMode.ENTITY}
                                className="text-xs"
                            >
                                По сущностям
                            </TabsTrigger>
                            <TabsTrigger
                                value={EHistoryViewMode.DATE}
                                className="text-xs"
                            >
                                По датам
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                )
            }
        >
            {/*
             * Узел показа для ленивой загрузки: свёрнутая карточка контент
             * не монтирует (Radix Collapsible), поэтому наблюдатель честно
             * видит только «раскрыта И во вьюпорте». Прослойка повторяет
             * flex-колонку CardContent и просто передаёт высоту дальше —
             * раскладка fill-режима (инцидент 27.08) не меняется.
             */}
            <div
                ref={attachReveal}
                className={cn('flex min-h-0 flex-col', fill && 'flex-1')}
            >
                {view.isListMissing ? (
                    <FallbackHistory items={fallback.items} />
                ) : (
                    <SectionState
                        status={view.status}
                        isEmpty={view.isEmpty}
                        onRetry={() =>
                            dispatch(loadEventSalesHistory({ reset: true }))
                        }
                        emptyText="Записей по клиенту пока нет."
                    >
                        <div
                            className={cn(
                                'space-y-4 overflow-y-auto pr-1',
                                /*
                                 * Потолок есть и в fill-режиме: без него
                                 * длинная история растягивала ВКЛАДКУ, а за
                                 * ней и весь фрейм (подгонка под контент),
                                 * после чего модалки центрировались
                                 * относительно огромного фрейма и уезжали
                                 * далеко вниз (инцидент 27.08). Записи
                                 * скроллятся внутри, дозагрузка — «показать
                                 * ещё» по привязке.
                                 */
                                fill
                                    ? 'min-h-0 max-h-[32rem] flex-1'
                                    : 'max-h-96 min-h-40',
                            )}
                        >
                            {view.effectiveMode === EHistoryViewMode.ENTITY ? (
                                view.entityGroups.map(item => (
                                    <HistoryGroupSection
                                        key={item.group.binding.value}
                                        item={item}
                                        resolveResponsible={resolveResponsible}
                                        resolveStatus={resolveStatus}
                                    />
                                ))
                            ) : (
                                <ul className="space-y-2">
                                    {view.dateRecords.map(record => (
                                        <HistoryRecordRow
                                            key={record.id}
                                            record={record}
                                            responsible={resolveResponsible(
                                                record.responsibleId,
                                            )}
                                            status={resolveStatus(record)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </SectionState>
                )}
            </div>
        </SectionCard>
    );
};

export default EntityHistoryCard;
