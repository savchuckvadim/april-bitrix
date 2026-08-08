'use client';

import { FC, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { SectionState } from '@/modules/shared/SectionState';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { loadEventSalesHistory } from '../model/EVHistoryThunk';
import { usePortalHistory } from '../lib/hooks/use-portal-history';
import {
    EHistoryViewMode,
    HistoryViewMode,
    useHistoryView,
} from '../lib/hooks/use-history-view';
import { useHistoryResponsible } from '../lib/hooks/use-history-responsible';
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
 * Грузится при появлении секции; первые 50 записей каждой ленты — одним
 * batch'ем, дальше — скролл-догрузка конкретной ленты. Группировка
 * переключается: «по сущностям» (повторы схлопываются в первую группу)
 * или «по датам» (единая лента, свежие сверху).
 *
 * Если списка на портале нет, показываем поля самой сущности
 * (`op_history` / `op_mhistory`) — беднее, но лучше пустого экрана.
 */
export const EntityHistoryCard: FC = () => {
    const dispatch = useAppDispatch();
    const view = useHistoryView();
    const resolveResponsible = useHistoryResponsible();
    const fallback = usePortalHistory();

    useEffect(() => {
        dispatch(loadEventSalesHistory());
    }, [dispatch]);

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">
                    История
                    {view.status === 'ready' && !view.isListMissing
                        ? ` (${view.dateRecords.length})`
                        : ''}
                </CardTitle>
                {view.isListMissing ? (
                    fallback.items.length > 0 && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            из полей клиента
                        </span>
                    )
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
                )}
            </CardHeader>

            <CardContent>
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
                        <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
                            {view.mode === EHistoryViewMode.ENTITY ? (
                                view.entityGroups.map(item => (
                                    <HistoryGroupSection
                                        key={item.group.binding.value}
                                        item={item}
                                        resolveResponsible={resolveResponsible}
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
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </SectionState>
                )}
            </CardContent>
        </Card>
    );
};

export default EntityHistoryCard;
