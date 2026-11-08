'use client';

import { useState } from 'react';
import { AButton, AInput } from '@workspace/april-ui';
import { CABINET_TEXT as TEXT } from '../../../consts/cabinet.const';
import { useInviteCabinetMember } from '../../../lib/hooks/use-cabinet';
import type { CabinetAddMember, CabinetPasswordLink } from '../../../model';

type Field = 'email' | 'firstName' | 'lastName' | 'bitrixUserId';

const EMPTY: Record<Field, string> = {
    email: '',
    firstName: '',
    lastName: '',
    bitrixUserId: '',
};

interface CabinetAddMemberFormProps {
    portalId: number;
    onLink: (link: CabinetPasswordLink) => void;
}

/**
 * «Дать доступ»: человек получает учётку организации и доступ к кабинету
 * портала. Первый участник становится владельцем; «сразу владелец» —
 * передача прав April новому корневому пользователю.
 */
export const CabinetAddMemberForm = ({
    portalId,
    onLink,
}: CabinetAddMemberFormProps) => {
    const [form, setForm] = useState<Record<Field, string>>(EMPTY);
    const [makeOwner, setMakeOwner] = useState(false);
    const invite = useInviteCabinetMember(portalId, result => {
        setForm(EMPTY);
        setMakeOwner(false);
        if (result.passwordLink) onLink(result.passwordLink);
    });

    const set = (name: Field, value: string) =>
        setForm(prev => ({ ...prev, [name]: value }));
    const ready =
        form.email.includes('@') &&
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0;

    const submit = () => {
        const payload: CabinetAddMember = {
            email: form.email.trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            ...(form.bitrixUserId.trim()
                ? { bitrixUserId: form.bitrixUserId.trim() }
                : {}),
            ...(makeOwner ? { makeOwner: true } : {}),
        };
        invite.mutate(payload);
    };

    const field = (name: Field, label: string) => (
        <AInput<Field>
            label={label}
            errorMessage={null}
            nameForHandler={name}
            value={form[name]}
            handleChange={set}
            handleOnFocus={() => undefined}
        />
    );

    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">{TEXT.addTitle}</h4>
            <p className="text-sm text-muted-foreground">{TEXT.addHint}</p>
            <div className="grid gap-3 md:grid-cols-2">
                {field('email', TEXT.email)}
                {field('bitrixUserId', TEXT.bitrixUserId)}
                {field('lastName', TEXT.lastName)}
                {field('firstName', TEXT.firstName)}
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={makeOwner}
                    onChange={event => setMakeOwner(event.target.checked)}
                />
                {TEXT.makeOwner}
            </label>
            <div className="w-48">
                <AButton
                    title={TEXT.add}
                    isActive={ready && !invite.isPending}
                    clickHendler={submit}
                />
            </div>
        </div>
    );
};
