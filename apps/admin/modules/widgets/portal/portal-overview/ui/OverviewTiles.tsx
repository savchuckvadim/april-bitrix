'use client';

import { useApplicationComponents } from '@/modules/entities/marketplace/applications';
import { useLogsSummary } from '@/modules/entities/logs';
import { useCabinetCard } from '@/modules/entities/portal/cabinet';
import { useSupportGuide, useSupportOpenDialogs } from '@/modules/entities/support';
import { LOAD_WINDOW_HOURS } from '../consts/overview.const';
import { dialogsOfPortal, installedPlacementCount } from '../lib/overview-view';
import { OverviewTile } from './OverviewTile';

/**
 * Показатели одной строкой: приложение, виджеты, кабинет, Telegram,
 * ошибки за сутки, обращения в поддержку. Каждая плитка — своя ручка,
 * повторные запросы карточек ниже react-query не делает.
 */
export const OverviewTiles = ({ portalId, domain }: { portalId: number; domain: string }) => {
    const card = useCabinetCard(portalId).data;
    const components = useApplicationComponents(String(portalId)).data ?? [];
    const logs = useLogsSummary({ hours: LOAD_WINDOW_HOURS, domain }).data;
    const lineDomain = useSupportGuide().data?.lineDomain;
    const support = useSupportOpenDialogs(lineDomain).data;

    const app = card?.app;
    const members = card?.members.filter(member => !member.revoked && member.role !== 'pending') ?? [];
    const owner = card?.members.find(member => member.role === 'owner' && !member.revoked);
    const errors = logs?.apps.reduce((sum, item) => sum + item.errors, 0);
    const dialogs = support ? dialogsOfPortal(support.dialogs, domain) : null;

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <OverviewTile
                label="Приложение April"
                value={!app ? '…' : app.installed ? 'установлено' : 'не установлено'}
                hint={app?.installStatus && app.installStatus !== 'installed' ? `шаг: ${app.installStatus}` : undefined}
                tone={!app ? 'muted' : app.installed ? 'success' : 'warning'}
                href={`/portal/${portalId}/cabinet`}
            />
            <OverviewTile
                label="Виджеты"
                value={`${installedPlacementCount(components)} привязок`}
                hint={app ? `по списку: ${app.widgets.length}` : undefined}
                tone={app && app.widgets.length && !installedPlacementCount(components) ? 'warning' : 'muted'}
                href={`/portal/${portalId}/cabinet`}
            />
            <OverviewTile
                label="Кабинет клиента"
                value={card ? `${members.length} участн.` : '…'}
                hint={owner ? `владелец: ${owner.firstName} ${owner.lastName}`.trim() : 'владельца нет'}
                tone={owner ? 'success' : 'muted'}
                href={`/portal/${portalId}/cabinet`}
            />
            <OverviewTile
                label="Telegram"
                value={card ? `${card.telegram.length} чатов` : '…'}
                hint="привязанные сотрудники"
                tone={card?.telegram.length ? 'info' : 'muted'}
                href={`/portal/${portalId}/cabinet`}
            />
            <OverviewTile
                label={`Ошибки за ${LOAD_WINDOW_HOURS} ч`}
                value={errors === undefined ? '…' : String(errors)}
                hint="по журналам приложений"
                tone={errors === undefined ? 'muted' : errors > 0 ? 'destructive' : 'success'}
                href="/logs"
            />
            <OverviewTile
                label="Поддержка"
                value={dialogs === null ? '…' : `${dialogs.length} открытых`}
                hint="обращения с этого портала"
                tone={dialogs?.length ? 'warning' : 'muted'}
                href="/support"
            />
        </div>
    );
};
