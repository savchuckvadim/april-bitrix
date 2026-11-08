'use client';

import type { AdminPortalResponseDto } from '@workspace/nest-admin-api';
import { AutomationCard } from './cards/AutomationCard';
import { ConnectionCard } from './cards/ConnectionCard';
import { LinksCard } from './cards/LinksCard';
import { LoadCard } from './cards/LoadCard';
import { SupportCard } from './cards/SupportCard';
import { WidgetsCard } from './cards/WidgetsCard';
import { OverviewHeader } from './OverviewHeader';
import { OverviewTiles } from './OverviewTiles';

/**
 * Сводка портала в админке: шапка со ссылкой на сам портал, показатели,
 * подключение и виджеты, нагрузка и ошибки, поддержка, AI и хуки, полезные
 * ссылки. Каждая карточка грузит свои данные сама — одна упавшая ручка не
 * ломает страницу.
 */
export const PortalOverview = ({ portal }: { portal: AdminPortalResponseDto }) => {
    const domain = portal.domain ?? '';
    return (
        <div className="space-y-4">
            <OverviewHeader portal={portal} />
            {domain && <OverviewTiles portalId={portal.id} domain={domain} />}
            <div className="grid gap-4 lg:grid-cols-2">
                <ConnectionCard portal={portal} />
                <WidgetsCard portalId={portal.id} />
                {domain && <LoadCard portalId={portal.id} domain={domain} />}
                {domain && <SupportCard domain={domain} />}
                {domain && <AutomationCard portalId={portal.id} domain={domain} />}
            </div>
            {domain && <LinksCard portalId={portal.id} domain={domain} />}
        </div>
    );
};
