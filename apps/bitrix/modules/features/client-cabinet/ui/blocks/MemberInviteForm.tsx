'use client';

import { useState } from 'react';
import { AButton, AInput } from '@workspace/april-ui';
import {
    inviteCabinetMember,
    type CabinetPasswordLink,
} from '@workspace/bitrix';
import { useCabinetAction } from '../../lib/cabinet-hooks';

type Field = 'email' | 'lastName' | 'firstName' | 'bitrixUserId';

const EMPTY: Record<Field, string> = {
    email: '',
    lastName: '',
    firstName: '',
    bitrixUserId: '',
};

/** Владелец даёт доступ сотруднику: email, имя, ID в Битрикс24 по желанию. */
export const MemberInviteForm = ({
    portalId,
    onDone,
}: {
    portalId: number;
    onDone: (link: CabinetPasswordLink | null) => void;
}) => {
    const [form, setForm] = useState<Record<Field, string>>(EMPTY);
    const action = useCabinetAction();
    const set = (name: Field, value: string) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const submit = async () => {
        const result = await action.run(() =>
            inviteCabinetMember(portalId, {
                email: form.email.trim(),
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                ...(form.bitrixUserId.trim()
                    ? { bitrixUserId: form.bitrixUserId.trim() }
                    : {}),
            }),
        );
        if (result) {
            setForm(EMPTY);
            onDone(result.passwordLink);
        }
    };

    const field = (name: Field, label: string) => (
        <AInput<Field>
            label={label}
            errorMessage={null}
            nameForHandler={name}
            value={form[name]}
            handleChange={set}
            handleOnFocus={() => action.clearError()}
        />
    );

    return (
        <div className="flex flex-col gap-3 border-t pt-4">
            <p className="text-sm font-medium">Дать доступ сотруднику</p>
            <div className="grid gap-3 md:grid-cols-2">
                {field('email', 'Email')}
                {field('bitrixUserId', 'ID в Битрикс24 (если знаете)')}
                {field('lastName', 'Фамилия')}
                {field('firstName', 'Имя')}
            </div>
            {action.error && <p className="text-sm text-destructive">{action.error}</p>}
            <div className="w-48">
                <AButton
                    title={action.busy ? 'Выдаём…' : 'Дать доступ'}
                    isActive={
                        !action.busy &&
                        form.email.includes('@') &&
                        form.firstName.trim().length > 0 &&
                        form.lastName.trim().length > 0
                    }
                    clickHendler={() => void submit()}
                />
            </div>
        </div>
    );
};
