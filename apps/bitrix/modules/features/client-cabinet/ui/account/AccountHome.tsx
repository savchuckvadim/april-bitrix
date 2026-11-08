'use client';

import Link from 'next/link';
import { ABadge, SectionCard, Spinner } from '@workspace/april-ui';
import { getCabinetProfile, type CabinetPortalSummary } from '@workspace/bitrix';
import { useCabinetLoad } from '../../lib/cabinet-hooks';
import { ROLE_TITLE } from '../../lib/cabinet-texts';

const approvalText = (portal: CabinetPortalSummary): string =>
    portal.approvalStatus === 'blocked'
        ? 'подключение приостановлено'
        : portal.approvalStatus === 'pending'
          ? 'ждёт подключения'
          : 'подключён';

/** Главная кабинета на сайте: кто вошёл и его порталы. */
export const AccountHome = () => {
    const profile = useCabinetLoad(() => getCabinetProfile(), []);

    if (profile.loading) return <Spinner />;
    if (profile.error || !profile.data) {
        return <p className="text-sm text-destructive">{profile.error}</p>;
    }

    const { data } = profile;
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold">
                    {data.firstName ? `${data.firstName}, здравствуйте!` : 'Здравствуйте!'}
                </h1>
                <p className="text-sm text-muted-foreground">{data.email}</p>
            </div>
            <SectionCard title="Мои порталы" description="Порталы Битрикс24, к кабинету которых у вас есть доступ.">
                <div className="flex flex-col gap-2">
                    {data.portals.map((portal) => (
                        <Link
                            key={portal.portalId}
                            href={`/account/portal/${portal.portalId}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 hover:bg-muted/50"
                        >
                            <div>
                                <div className="font-medium">{portal.domain ?? `Портал ${portal.portalId}`}</div>
                                <div className="text-xs text-muted-foreground">
                                    {portal.organization ?? ''} · {approvalText(portal)}
                                </div>
                            </div>
                            {portal.role && (
                                <ABadge
                                    title={ROLE_TITLE[portal.role]}
                                    size="small"
                                    color={portal.role === 'owner' ? 'april' : 'grey'}
                                />
                            )}
                        </Link>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};
