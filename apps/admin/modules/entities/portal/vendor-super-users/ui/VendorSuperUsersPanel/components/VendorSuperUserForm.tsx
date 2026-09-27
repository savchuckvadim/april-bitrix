'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { VENDOR_SUPER_USERS_TEXT as TEXT } from '../../../consts/vendor-super-users.const';
import { useVendorSuperUserForm } from '../../../lib/hooks/use-vendor-super-user-form';

interface VendorSuperUserFormProps {
    portalId: number;
}

/** Добавление сотрудника April. Состояние и проверка — в хуке формы. */
export const VendorSuperUserForm = ({
    portalId,
}: VendorSuperUserFormProps) => {
    const form = useVendorSuperUserForm(portalId);

    return (
        <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={event => {
                event.preventDefault();
                form.submit();
            }}
        >
            <div className="flex flex-col gap-1">
                <Label htmlFor="vendor-super-user-bitrix-id">
                    {TEXT.bitrixIdLabel}
                </Label>
                <Input
                    id="vendor-super-user-bitrix-id"
                    className="w-32"
                    inputMode="numeric"
                    placeholder={TEXT.bitrixIdPlaceholder}
                    value={form.bitrixId}
                    onChange={event => form.setBitrixId(event.target.value)}
                    onBlur={form.onBlur}
                    aria-invalid={!!form.error}
                />
            </div>
            <div className="flex flex-col gap-1">
                <Label htmlFor="vendor-super-user-comment">
                    {TEXT.commentLabel}
                </Label>
                <Input
                    id="vendor-super-user-comment"
                    className="w-64"
                    placeholder={TEXT.commentPlaceholder}
                    value={form.comment}
                    onChange={event => form.setComment(event.target.value)}
                />
            </div>
            <Button type="submit" disabled={!form.canSubmit}>
                {form.isPending ? TEXT.submitPending : TEXT.submit}
            </Button>
            {form.error && (
                <p className="w-full text-sm text-destructive">{form.error}</p>
            )}
        </form>
    );
};
