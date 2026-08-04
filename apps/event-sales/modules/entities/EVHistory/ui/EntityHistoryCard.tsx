'use client';

import { FC, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { SectionState } from '@/modules/shared/SectionState';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { loadEventSalesHistory } from '../model/EVHistoryThunk';
import { usePortalHistory } from '../lib/hooks/use-portal-history';

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
 * История работы по клиенту из портального списка «ОП История».
 *
 * Грузится при появлении секции, а не при старте приложения: у давнего клиента
 * это сотни записей. Первым запросом берём сотню, дальше — по кнопке.
 *
 * Если списка на портале нет, показываем то, что лежит в полях самой сущности
 * (`op_history` / `op_mhistory`). Это заметно беднее, но лучше пустого экрана —
 * и честно подписано, откуда данные.
 */
export const EntityHistoryCard: FC = () => {
    const dispatch = useAppDispatch();

    const items = useAppSelector(s => s.eventHistory.items);
    const status = useAppSelector(s => s.eventHistory.status);
    const next = useAppSelector(s => s.eventHistory.next);
    const total = useAppSelector(s => s.eventHistory.total);
    const isListMissing = useAppSelector(s => s.eventHistory.isListMissing);

    const fallback = usePortalHistory();

    useEffect(() => {
        dispatch(loadEventSalesHistory());
    }, [dispatch]);

    const count = total ?? items.length;

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">
                    История
                    {status === 'ready' && !isListMissing ? ` (${count})` : ''}
                </CardTitle>
                {isListMissing && fallback.items.length > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                        из полей клиента
                    </span>
                )}
            </CardHeader>

            <CardContent>
                {isListMissing ? (
                    <FallbackHistory items={fallback.items} />
                ) : (
                    <SectionState
                        status={status}
                        isEmpty={!items.length}
                        onRetry={() =>
                            dispatch(loadEventSalesHistory({ reset: true }))
                        }
                        emptyText="Записей по клиенту пока нет."
                    >
                        <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                            {items.map(item => (
                                <li
                                    key={item.id}
                                    className="border-l-2 border-border pl-2"
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="min-w-0 truncate text-sm text-foreground">
                                            {item.title}
                                        </span>
                                        {item.date && (
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {item.date}
                                            </span>
                                        )}
                                    </div>
                                    {item.comment && (
                                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                                            {item.comment}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {next !== null && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 w-full"
                                onClick={() => dispatch(loadEventSalesHistory())}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading'
                                    ? 'Загружаем…'
                                    : 'Показать ещё'}
                            </Button>
                        )}
                    </SectionState>
                )}
            </CardContent>
        </Card>
    );
};

export default EntityHistoryCard;
