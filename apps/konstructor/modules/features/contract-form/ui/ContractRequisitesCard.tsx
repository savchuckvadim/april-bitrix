'use client';

import { FileText } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { useContractRequisites } from '../hooks/use-contract-requisites';

/** Реквизиты клиента для договора: выбранный реквизит, заполненность, чего не хватает. */
export const ContractRequisitesCard = () => {
    const rq = useContractRequisites();

    return (
        <SectionCard
            title="Реквизиты клиента"
            description={`Тип клиента по сделке: ${rq.clientTypeName}.`}
            tone="complect"
            actions={
                <Button variant="outline" size="sm" onClick={rq.toRequisites}>
                    <FileText className="h-4 w-4" />
                    Реквизиты
                </Button>
            }
            state={rq.missing.length ? 'warning' : undefined}
            message={rq.missing.length ? `Не заполнено: ${rq.missing.join(', ')}` : null}
        >
            {rq.isLoading ? (
                <p className="text-sm text-muted-foreground">Загружаю реквизиты…</p>
            ) : rq.title ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{rq.title}</span>
                    <Badge variant="outline">заполнено {rq.fill.full}%</Badge>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Реквизит не выбран — договор не собрать.</p>
            )}
        </SectionCard>
    );
};
