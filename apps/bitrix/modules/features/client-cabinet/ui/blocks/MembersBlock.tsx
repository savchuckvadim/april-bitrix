'use client';

import { useState } from 'react';
import { ABadge, AButton, SectionCard } from '@workspace/april-ui';
import {
    approveCabinetMember,
    listCabinetMembers,
    makeCabinetOwner,
    revokeCabinetMember,
    type CabinetMember,
    type CabinetPasswordLink,
} from '@workspace/bitrix';
import { useCabinetAction, useCabinetLoad } from '../../lib/cabinet-hooks';
import { formatDateTime, ROLE_TITLE } from '../../lib/cabinet-texts';
import { MemberInviteForm } from './MemberInviteForm';

/**
 * Сотрудники с доступом к кабинету портала — управляет владелец: даёт
 * доступ, подтверждает заявки из Битрикс24, передаёт права, снимает доступ.
 */
export const MembersBlock = ({ portalId }: { portalId: number }) => {
    const members = useCabinetLoad(() => listCabinetMembers(portalId), [portalId]);
    const action = useCabinetAction();
    const [link, setLink] = useState<CabinetPasswordLink | null>(null);

    const act = async (run: () => Promise<unknown>, confirmText?: string) => {
        if (confirmText && !window.confirm(confirmText)) return;
        const result = await action.run(run);
        if (result) members.reload();
    };

    const actions = (member: CabinetMember) =>
        member.revoked || member.role === 'owner' ? null : (
            <div className="flex flex-wrap justify-end gap-2">
                {member.role === 'pending' && (
                    <AButton
                        title="Подтвердить"
                        size="xsmall"
                        isActive={!action.busy}
                        clickHendler={() => void act(() => approveCabinetMember(portalId, member.id))}
                    />
                )}
                {member.role === 'member' && (
                    <AButton
                        title="Передать права владельца"
                        size="xsmall"
                        color="grey"
                        isActive={!action.busy}
                        clickHendler={() =>
                            void act(
                                () => makeCabinetOwner(portalId, member.id),
                                'Передать права владельца? Вы станете участником.',
                            )
                        }
                    />
                )}
                <AButton
                    title={member.role === 'pending' ? 'Отклонить' : 'Снять доступ'}
                    size="xsmall"
                    color="danger"
                    isActive={!action.busy}
                    clickHendler={() =>
                        void act(() => revokeCabinetMember(portalId, member.id), 'Снять доступ к кабинету?')
                    }
                />
            </div>
        );

    return (
        <SectionCard
            title="Доступ к кабинету"
            description="Кто из сотрудников видит кабинет портала. Владелец один — он управляет доступами."
        >
            <div className="flex flex-col gap-3">
                {members.error && <p className="text-sm text-destructive">{members.error}</p>}
                {action.error && <p className="text-sm text-destructive">{action.error}</p>}
                {link && (
                    <div className="rounded-md border border-dashed p-3 text-sm">
                        {link.emailSent
                            ? 'Письмо со ссылкой для пароля отправлено.'
                            : 'Письмо не отправилось. Передайте сотруднику ссылку сами (лично, не в общий чат):'}
                        {!link.emailSent && (
                            <code className="mt-1 block break-all rounded bg-muted px-2 py-1 text-xs">{link.url}</code>
                        )}
                        <span className="mt-1 block text-xs text-muted-foreground">
                            Ссылка действует до {formatDateTime(link.expiresAt)}.
                        </span>
                    </div>
                )}
                {members.data
                    ?.filter((member) => !member.revoked)
                    .map((member) => (
                        <div key={member.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-sm last:border-b-0">
                            <div>
                                <div>
                                    {member.lastName} {member.firstName}{' '}
                                    <ABadge
                                        title={ROLE_TITLE[member.role]}
                                        size="xsmall"
                                        color={member.role === 'owner' ? 'april' : member.role === 'pending' ? 'warning' : 'grey'}
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {member.email}
                                    {member.hasPassword ? '' : ' · пароль ещё не задан'}
                                </div>
                            </div>
                            {actions(member)}
                        </div>
                    ))}
                <MemberInviteForm
                    portalId={portalId}
                    onDone={(created) => {
                        setLink(created);
                        members.reload();
                    }}
                />
            </div>
        </SectionCard>
    );
};
