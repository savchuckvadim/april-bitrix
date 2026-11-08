'use client';

import { getCabinetPortal, listCabinetPortals, type PortalSessionUser } from '@workspace/bitrix';
import { useCabinetLoad } from '../../lib/cabinet-hooks';
import { BitrixAppBlock } from './BitrixAppBlock';
import { MembersBlock } from './MembersBlock';
import { SiteAccessBlock } from './SiteAccessBlock';
import { TelegramBlock } from './TelegramBlock';

/**
 * Блоки кабинета во фрейме Битрикса (под продуктами и статусом установки):
 * доступ с сайта, Telegram, а владельцу — сотрудники с доступом. Портал и
 * сотрудник — из сессии фрейма, без ввода домена.
 */
export const FrameCabinetBlocks = ({ user }: { user?: PortalSessionUser }) => {
    const portal = useCabinetLoad(async () => {
        const [first] = await listCabinetPortals();
        return first ? getCabinetPortal(first.portalId) : null;
    }, []);

    if (portal.loading || !portal.data) {
        return portal.error ? (
            <p className="text-sm text-destructive">{portal.error}</p>
        ) : null;
    }

    const isOwner = portal.data.level === 'owner' || portal.data.level === 'platform';
    return (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SiteAccessBlock user={user} />
            <TelegramBlock portalId={portal.data.portalId} />
            {isOwner && (
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <MembersBlock portalId={portal.data.portalId} />
                    <BitrixAppBlock portalId={portal.data.portalId} />
                </div>
            )}
        </div>
    );
};
