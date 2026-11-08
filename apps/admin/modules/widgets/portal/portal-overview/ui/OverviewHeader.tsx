'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import type { AdminPortalResponseDto } from '@workspace/nest-admin-api';
import { useCabinetCard } from '@/modules/entities/portal/cabinet';
import {
    APPROVAL_TITLE,
    OVERVIEW_TEXT as TEXT,
    portalDevUrl,
    portalUrl,
} from '../consts/overview.const';

const date = (iso?: string | null): string =>
    iso ? new Date(iso).toLocaleDateString('ru-RU') : '—';

/**
 * Шапка сводки: домен со ссылкой на сам портал, member_id, организация,
 * допуск и даты; кнопки «Изменить» и «Регионы».
 */
export const OverviewHeader = ({ portal }: { portal: AdminPortalResponseDto }) => {
    const card = useCabinetCard(portal.id);
    const domain = portal.domain ?? '';
    const approval = portal.approval_status ? APPROVAL_TITLE[portal.approval_status] : null;
    const organization = card.data?.organization;

    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold">{domain || `Портал #${portal.id}`}</h1>
                    <ToneBadge tone={approval?.tone ?? 'muted'} variant="soft">
                        {approval?.label ?? TEXT.legacyClient}
                    </ToneBadge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>ID {portal.id}</span>
                    {portal.member_id && (
                        <span title="member_id — постоянный идентификатор портала">
                            member_id <code className="text-xs">{portal.member_id}</code>
                        </span>
                    )}
                    <span>
                        {portal.client_id ? (
                            <Link href={`/client/${portal.client_id}`} className="text-primary hover:underline">
                                {organization ?? `организация #${portal.client_id}`}
                            </Link>
                        ) : (
                            TEXT.noOrganization
                        )}
                    </span>
                    <span>создан {date(portal.created_at)}</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {domain && (
                    <Button asChild size="sm">
                        <a href={portalUrl(domain)} target="_blank" rel="noreferrer">
                            {TEXT.openPortal} <ExternalLink className="ml-1 size-3.5" />
                        </a>
                    </Button>
                )}
                {domain && (
                    <Button asChild size="sm" variant="outline">
                        <a href={portalDevUrl(domain)} target="_blank" rel="noreferrer">
                            {TEXT.devSection} <ExternalLink className="ml-1 size-3.5" />
                        </a>
                    </Button>
                )}
                <Button asChild size="sm" variant="outline">
                    <Link href={`/portal/${portal.id}/edit`}>Изменить</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                    <Link href={`/portal/${portal.id}/garant/regions`}>Регионы</Link>
                </Button>
            </div>
        </div>
    );
};
