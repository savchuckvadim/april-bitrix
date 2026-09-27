'use client';

import { VENDOR_SUPER_USERS_TEXT as TEXT } from '../../consts/vendor-super-users.const';
import { useVendorSuperUsers } from '../../lib/hooks/use-vendor-super-users';
import { VendorSuperUserForm } from './components/VendorSuperUserForm';
import { VendorSuperUserRow } from './components/VendorSuperUserRow';

interface VendorSuperUsersPanelProps {
    portalId: number;
}

/**
 * Панель «Суперпользователи April» карточки портала.
 *
 * Источник правды — таблица `vendor_super_users`; раньше список задавался
 * env `BX_SUPER_USER_IDS` и правился только с перезапуском бэка. Правки
 * применяются сразу: бэк сбрасывает кэш домена после каждой записи.
 */
export const VendorSuperUsersPanel = ({
    portalId,
}: VendorSuperUsersPanelProps) => {
    const { data, isLoading, isError } = useVendorSuperUsers(portalId);

    return (
        <section className="flex flex-col gap-4">
            <header className="flex flex-col gap-1">
                <h3 className="text-base font-medium">{TEXT.title}</h3>
                <p className="text-sm text-muted-foreground">
                    {TEXT.description}
                </p>
                <p className="text-sm text-muted-foreground">
                    {TEXT.notToConfuse}
                </p>
            </header>

            {isLoading && (
                <p className="text-sm text-muted-foreground">{TEXT.loading}</p>
            )}
            {isError && (
                <p className="text-sm text-destructive">{TEXT.loadError}</p>
            )}

            {!isLoading && !isError && data && data.length === 0 && (
                <p className="text-sm text-muted-foreground">{TEXT.empty}</p>
            )}

            {!isLoading && !isError && data && data.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[32rem] text-left">
                        <thead>
                            <tr className="border-b text-xs text-muted-foreground">
                                <th className="py-2 pr-4 font-normal">
                                    {TEXT.tableBitrixId}
                                </th>
                                <th className="py-2 pr-4 font-normal">
                                    {TEXT.tableComment}
                                </th>
                                <th className="py-2 pr-4 font-normal">
                                    {TEXT.tableState}
                                </th>
                                <th className="py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(user => (
                                <VendorSuperUserRow
                                    key={user.id}
                                    portalId={portalId}
                                    user={user}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-medium">{TEXT.addTitle}</h4>
                <VendorSuperUserForm portalId={portalId} />
            </div>
        </section>
    );
};
