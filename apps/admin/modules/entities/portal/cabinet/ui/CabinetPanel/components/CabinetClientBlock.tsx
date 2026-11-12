'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AButton, ASelect } from '@workspace/april-ui';
import { useClients } from '@/modules/entities/client';
import { CABINET_TEXT as TEXT } from '../../../consts/cabinet.const';
import { useAttachCabinetClient } from '../../../lib/hooks/use-cabinet';
import type { CabinetPortalCard } from '../../../model';
import { CabinetCreateClientForm } from './CabinetCreateClientForm';

interface CabinetClientBlockProps {
    card: CabinetPortalCard;
}

/** Выбор уже заведённой организации — второй портал того же клиента. */
function PickExistingClient({ portalId }: { portalId: number }) {
    // Пустые фильтры = все организации (бэк применяет только непустые):
    // и заведённые вручную, и пришедшие заявкой онбординга.
    const { data: clients } = useClients({ status: '', is_active: '' });
    const attach = useAttachCabinetClient(portalId);
    const [picked, setPicked] = useState<number | null>(null);

    const items = (clients ?? []).map(client => ({
        id: Number(client.id),
        name: client.email ? `${client.name} (${client.email})` : client.name,
    }));
    // ASelect отдаёт строку id выбранного пункта
    const onPick = (_name: string, value: string) => {
        const id = Number(value);
        setPicked(Number.isInteger(id) && id > 0 ? id : null);
    };

    return (
        <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-64">
                <ASelect
                    label={TEXT.clientPick}
                    nameForHandler="cabinet-client"
                    items={items}
                    current={items.find(item => item.id === picked)}
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
        </div>
    );
}

/**
 * Организация портала. Нет организации — «Создать и привязать» прямо здесь
 * (или выбрать заведённую: у клиента может быть несколько порталов). Есть —
 * ссылка на страницу клиента и «Отвязать».
 */
export const CabinetClientBlock = ({ card }: CabinetClientBlockProps) => {
    const attach = useAttachCabinetClient(card.portalId);

    const detach = () => {
        if (!window.confirm(TEXT.clientDetachConfirm)) return;
        attach.mutate(null);
    };

    if (card.clientId === null) {
        return (
            <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium">{TEXT.clientTitle}</h4>
                <p className="text-sm text-muted-foreground">{TEXT.clientNone}</p>
                <CabinetCreateClientForm portalId={card.portalId} domain={card.domain} />
                <p className="text-xs text-muted-foreground">{TEXT.clientOr}</p>
                <PickExistingClient portalId={card.portalId} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">{TEXT.clientTitle}</h4>
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium">{card.organization}</span>
                <span className="text-muted-foreground">#{card.clientId}</span>
                <Link href={`/client/${card.clientId}`} className="text-primary hover:underline">
                    {TEXT.clientOpen}
                </Link>
                <AButton
                    title={TEXT.clientDetach}
                    size="small"
                    color="grey"
                    isActive={!attach.isPending}
                    clickHendler={detach}
                />
            </div>
        </div>
    );
};
