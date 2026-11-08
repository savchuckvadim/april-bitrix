'use client';

import { useState } from 'react';
import { AButton, ASelect } from '@workspace/april-ui';
import { useClients } from '@/modules/entities/client';
import { CABINET_TEXT as TEXT } from '../../../consts/cabinet.const';
import { useAttachCabinetClient } from '../../../lib/hooks/use-cabinet';
import type { CabinetPortalCard } from '../../../model';

interface CabinetClientBlockProps {
    card: CabinetPortalCard;
}

/**
 * Организация портала. У клиента может быть несколько порталов, поэтому
 * связь задаётся здесь, на портале. Действующим порталам без клиента
 * организацию заводят в «Клиентах» и выбирают в списке.
 */
export const CabinetClientBlock = ({ card }: CabinetClientBlockProps) => {
    // Пустые фильтры = все организации (бэк применяет только непустые):
    // и заведённые вручную, и пришедшие заявкой онбординга.
    const { data: clients } = useClients({ status: '', is_active: '' });
    const attach = useAttachCabinetClient(card.portalId);
    const [picked, setPicked] = useState<number | null>(card.clientId);

    const items = (clients ?? []).map(client => ({
        id: Number(client.id),
        name: client.email ? `${client.name} (${client.email})` : client.name,
    }));
    const current = items.find(item => item.id === picked);
    // ASelect отдаёт строку id выбранного пункта
    const onPick = (_name: string, value: string) => {
        const id = Number(value);
        setPicked(Number.isInteger(id) && id > 0 ? id : null);
    };

    const detach = () => {
        if (!window.confirm(TEXT.clientDetachConfirm)) return;
        attach.mutate(null);
    };

    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">{TEXT.clientTitle}</h4>
            {card.organization ? (
                <p className="text-sm">
                    {card.organization}{' '}
                    <span className="text-muted-foreground">#{card.clientId}</span>
                </p>
            ) : (
                <p className="text-sm text-muted-foreground">{TEXT.clientNone}</p>
            )}
            <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-64">
                    <ASelect
                        label={TEXT.clientPick}
                        nameForHandler="cabinet-client"
                        items={items}
                        current={current}
                        handleChange={onPick}
                    />
                </div>
                <div>
                    <AButton
                        title={TEXT.clientSave}
                        size="small"
                        isActive={!attach.isPending && picked !== null}
                        clickHendler={() => picked !== null && attach.mutate(picked)}
                    />
                </div>
                {card.clientId !== null && (
                    <div>
                        <AButton
                            title={TEXT.clientDetach}
                            size="small"
                            color="grey"
                            isActive={!attach.isPending}
                            clickHendler={detach}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
