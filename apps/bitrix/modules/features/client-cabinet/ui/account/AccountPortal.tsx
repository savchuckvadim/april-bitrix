'use client';

import Link from 'next/link';
import { ABadge, SectionCard, Spinner } from '@workspace/april-ui';
import { getCabinetPortal } from '@workspace/bitrix';
import { useCabinetLoad } from '../../lib/cabinet-hooks';
import { PART_TITLE, ROLE_TITLE } from '../../lib/cabinet-texts';
import { MembersBlock } from '../blocks/MembersBlock';
import { TelegramBlock } from '../blocks/TelegramBlock';

/**
 * Портал в кабинете на сайте: что подключено, Telegram и (владельцу)
 * доступы сотрудников. Настройки частей приложения появятся здесь позже.
 */
export const AccountPortal = ({ portalId }: { portalId: number }) => {
    const portal = useCabinetLoad(() => getCabinetPortal(portalId), [portalId]);

    if (portal.loading) return <Spinner />;
    if (portal.error || !portal.data) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-sm text-destructive">{portal.error}</p>
                <Link href="/account" className="text-sm text-primary hover:underline">
                    К моим порталам
                </Link>
            </div>
        );
    }

    const data = portal.data;
    const isOwner = data.level === 'owner' || data.level === 'platform';
    return (
        <div className="flex flex-col gap-6">
            <Link href="/account" className="text-sm text-primary hover:underline">
                ← Мои порталы
            </Link>
            <SectionCard
                title={data.domain ?? `Портал ${data.portalId}`}
                description={data.organization ?? undefined}
                actions={
                    data.role ? (
                        <ABadge title={ROLE_TITLE[data.role]} size="small" color={isOwner ? 'april' : 'grey'} />
                    ) : undefined
                }
            >
                <p className="text-sm">
                    Подключено:{' '}
                    {data.enabledParts.length > 0
                        ? data.enabledParts.map((part) => PART_TITLE[part] ?? part).join(', ')
                        : 'состав уточняется — его ведёт April по договору'}
                </p>
            </SectionCard>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TelegramBlock portalId={data.portalId} />
                {isOwner && <MembersBlock portalId={data.portalId} />}
            </div>
        </div>
    );
};
