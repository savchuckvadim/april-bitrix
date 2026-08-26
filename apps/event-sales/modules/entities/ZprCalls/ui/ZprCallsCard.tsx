'use client';

import { FC } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { SectionState } from '@/modules/shared/SectionState';
import { useZprCalls } from '../lib/hooks/use-zpr-calls';
import { ZprCallsList } from './ZprCallsList';

/**
 * Карточка «Звонки по решению» для экрана клиента — та же стилистика, что у
 * RelatedDealsCard/RelatedLeadsCard.
 *
 * Self-gate: у клиента нет ссылок op_zprs (или поле не установлено на
 * портале) — карточка не рендерится и ничего не запрашивает; пустая карточка
 * на экране клиента была бы только шумом (решение владельца о секциях 20.08).
 */
export const ZprCallsCard: FC = () => {
    const calls = useZprCalls();
    if (calls.isSilent) return null;

    const count = calls.open.length + calls.closedTotal;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-base">
                    Звонки по решению
                    {calls.status === 'ready' ? ` (${count})` : ''}
                </CardTitle>
            </CardHeader>

            <CardContent className="max-h-80 overflow-y-auto">
                <SectionState
                    status={calls.status}
                    isEmpty={!calls.open.length && !calls.closed.length}
                    onRetry={calls.refetch}
                    emptyText="Элементы ЗПР не прочитались из смарта."
                >
                    <ZprCallsList calls={calls} />
                </SectionState>
            </CardContent>
        </Card>
    );
};

export default ZprCallsCard;
