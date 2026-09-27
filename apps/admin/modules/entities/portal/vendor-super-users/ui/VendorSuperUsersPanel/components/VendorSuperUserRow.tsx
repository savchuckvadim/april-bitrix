'use client';

import { Button } from '@workspace/ui/components/button';
import { VENDOR_SUPER_USERS_TEXT as TEXT } from '../../../consts/vendor-super-users.const';
import {
    useRemoveVendorSuperUser,
    useSaveVendorSuperUser,
} from '../../../lib/hooks/use-vendor-super-users';
import type { VendorSuperUser } from '../../../model';

interface VendorSuperUserRowProps {
    portalId: number;
    user: VendorSuperUser;
}

/**
 * Строка списка: кто это, состояние доступа и два действия.
 *
 * «Снять доступ» и «Удалить» разведены намеренно: снятие сохраняет запись
 * (видно, кто имел доступ), удаление убирает её совсем и поэтому
 * подтверждается.
 */
export const VendorSuperUserRow = ({
    portalId,
    user,
}: VendorSuperUserRowProps) => {
    const save = useSaveVendorSuperUser();
    const remove = useRemoveVendorSuperUser();
    const busy = save.isPending || remove.isPending;

    const toggle = () =>
        save.mutate({
            portalId,
            payload: {
                bitrixId: user.bitrixId,
                comment: user.comment,
                isActive: !user.isActive,
            },
        });

    const onRemove = () => {
        if (!window.confirm(TEXT.removeConfirm)) return;
        remove.mutate({ portalId, bitrixId: user.bitrixId });
    };

    return (
        <tr className="border-b last:border-b-0">
            <td className="py-2 pr-4 font-mono text-sm">{user.bitrixId}</td>
            <td className="py-2 pr-4 text-sm">
                {user.comment || (
                    <span className="text-muted-foreground">—</span>
                )}
            </td>
            <td className="py-2 pr-4 text-sm">
                {user.isActive ? (
                    <span className="text-foreground">{TEXT.active}</span>
                ) : (
                    <span className="text-muted-foreground">
                        {TEXT.inactive}
                    </span>
                )}
            </td>
            <td className="py-2 text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={toggle}
                    >
                        {user.isActive ? TEXT.disable : TEXT.enable}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={onRemove}
                    >
                        {TEXT.remove}
                    </Button>
                </div>
            </td>
        </tr>
    );
};
