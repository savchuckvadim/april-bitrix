'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { AButton, ASelect } from '@workspace/april-ui';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import type { ClientOverviewPortal } from '@/modules/entities/client';
import { usePortals } from '@/modules/entities/portal';
import { AUTH_MODE_TITLE, useAttachPortalToClient } from '@/modules/entities/portal/cabinet';
import { portalCabinetHref } from '../lib/client-checklist';

/** Портал организации: владелец, люди, приложение, куда идти. */
function PortalRow({ portal }: { portal: ClientOverviewPortal }) {
    const owner = portal.owner;
    return (
        <li className="space-y-1 border-t py-3 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-2">
                <Link href={`/portal/${portal.portalId}`} className="font-medium text-primary hover:underline">
                    {portal.domain ?? `портал #${portal.portalId}`}
                </Link>
                {portal.domain && (
                    <a
                        href={`https://${portal.domain}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                    >
                        открыть портал <ExternalLink className="size-3" />
                    </a>
                )}
                <ToneBadge tone={portal.appInstalled ? 'success' : 'muted'} size="sm">
                    {portal.appInstalled ? 'приложение April стоит' : 'без приложения'}
                </ToneBadge>
            </div>
            <p className="text-sm">
                {owner ? (
                    <>
                        Владелец: {owner.name}
                        {owner.email ? <span className="text-muted-foreground"> · {owner.email}</span> : null}
                        <span className={owner.hasPassword ? 'text-muted-foreground' : 'text-warning'}>
                            {owner.hasPassword ? ' · пароль задан' : ' · пароль не задан'}
                        </span>
                    </>
                ) : (
                    <span className="text-warning">Владельца нет — «Кабинет» → «Дать доступ»</span>
                )}
            </p>
            <p className="text-xs text-muted-foreground">
                Участников {portal.members}
                {portal.pending ? `, заявок ${portal.pending}` : ''} · Telegram-чатов {portal.telegram} · Битрикс:{' '}
                {AUTH_MODE_TITLE[portal.bitrixAuthMode] ?? portal.bitrixAuthMode}
            </p>
            <Link href={portalCabinetHref(portal.portalId)} className="text-sm text-primary hover:underline">
                Кабинет портала: доступы, ссылки на пароль, Telegram
            </Link>
        </li>
    );
}

/** Привязать к организации портал, у которого клиента ещё нет. */
function AttachPortal({ clientId }: { clientId: number }) {
    const { data: portals } = usePortals();
    const attach = useAttachPortalToClient();
    const [picked, setPicked] = useState<number | null>(null);
    const items = (portals ?? [])
        .filter(portal => !portal.client_id && portal.domain)
        .map(portal => ({ id: portal.id, name: portal.domain as string }));
    const onPick = (_name: string, value: string) => {
        const id = Number(value);
        setPicked(Number.isInteger(id) && id > 0 ? id : null);
    };

    return (
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t pt-3">
            <div className="min-w-64">
                <ASelect
                    label="Портал без организации"
                    nameForHandler="client-attach-portal"
                    items={items}
                    current={items.find(item => item.id === picked)}
                    handleChange={onPick}
                />
            </div>
            <div>
                <AButton
                    title="Привязать портал"
                    size="small"
                    isActive={picked !== null && !attach.isPending}
                    clickHendler={() => picked !== null && attach.mutate({ portalId: picked, clientId })}
                />
            </div>
        </div>
    );
}

/** Порталы организации и привязка ещё одного. */
export const ClientPortalsCard = ({ clientId, portals }: { clientId: number; portals: ClientOverviewPortal[] }) => (
    <SectionCard title="Порталы" description="Битрикс24 организации. Доступы и пароли — во вкладке «Кабинет» каждого портала.">
        {portals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Порталов пока нет — привяжите ниже.</p>
        ) : (
            <ul>
                {portals.map(portal => (
                    <PortalRow key={portal.portalId} portal={portal} />
                ))}
            </ul>
        )}
        <AttachPortal clientId={clientId} />
    </SectionCard>
);
