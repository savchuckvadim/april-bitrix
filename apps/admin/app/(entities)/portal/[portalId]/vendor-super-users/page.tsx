'use client';

import { useParams } from 'next/navigation';
import { VendorSuperUsersPanel } from '@/modules/entities/portal/vendor-super-users';

/**
 * Суперпользователи April на портале: сотрудники сопровождения, которым
 * нужна видимость всей структуры продаж, «Смотреть как…» и служебные
 * ссылки. Раньше список задавался env BX_SUPER_USER_IDS и правился только
 * с перезапуском бэка.
 */
export default function PortalVendorSuperUsersPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return <VendorSuperUsersPanel portalId={portalId} />;
}
