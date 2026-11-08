'use client';

import { ABadge, AButton } from '@workspace/april-ui';
import {
    CABINET_ROLE_TITLE,
    CABINET_TEXT as TEXT,
} from '../../../consts/cabinet.const';
import {
    useApproveCabinetMember,
    useCabinetPasswordLink,
    useMakeCabinetOwner,
    useRevokeCabinetMember,
} from '../../../lib/hooks/use-cabinet';
import type { CabinetMember, CabinetPasswordLink } from '../../../model';

interface CabinetMemberRowProps {
    portalId: number;
    member: CabinetMember;
    onLink: (link: CabinetPasswordLink) => void;
}

const ROLE_COLOR = {
    owner: 'april',
    member: 'grey',
    pending: 'warning',
} as const;

/** Участник: кто, роль, есть ли пароль, действия April. */
export const CabinetMemberRow = ({
    portalId,
    member,
    onLink,
}: CabinetMemberRowProps) => {
    const approve = useApproveCabinetMember(portalId);
    const makeOwner = useMakeCabinetOwner(portalId);
    const link = useCabinetPasswordLink(portalId, onLink);
    const revoke = useRevokeCabinetMember(portalId);
    const busy =
        approve.isPending ||
        makeOwner.isPending ||
        link.isPending ||
        revoke.isPending;

    const confirmThen = (text: string, run: () => void) => () => {
        if (window.confirm(text)) run();
    };

    return (
        <tr className="border-b last:border-b-0 align-top">
            <td className="py-2 pr-4 text-sm">
                <div>
                    {member.lastName} {member.firstName}
                </div>
                <div className="text-xs text-muted-foreground">
                    {member.email ?? '—'}
                    {member.bitrixUserId ? ` · Б24 #${member.bitrixUserId}` : ''}
                </div>
            </td>
            <td className="py-2 pr-4">
                <ABadge
                    title={
                        member.revoked
                            ? TEXT.revoked
                            : CABINET_ROLE_TITLE[member.role]
                    }
                    color={member.revoked ? 'grey' : ROLE_COLOR[member.role]}
                    size="small"
                />
                {!member.hasPassword && !member.revoked && (
                    <div className="mt-1 text-xs text-muted-foreground">
                        {TEXT.noPassword}
                    </div>
                )}
            </td>
            <td className="py-2">
                {!member.revoked && (
                    <div className="flex flex-wrap justify-end gap-2">
                        {member.role === 'pending' && (
                            <AButton
                                title={TEXT.approve}
                                size="xsmall"
                                isActive={!busy}
                                clickHendler={() => approve.mutate(member.id)}
                            />
                        )}
                        {member.role !== 'owner' && (
                            <AButton
                                title={TEXT.makeOwnerAction}
                                size="xsmall"
                                color="grey"
                                isActive={!busy}
                                clickHendler={confirmThen(
                                    TEXT.makeOwnerConfirm,
                                    () => makeOwner.mutate(member.id),
                                )}
                            />
                        )}
                        <AButton
                            title={TEXT.passwordLink}
                            size="xsmall"
                            color="grey"
                            isActive={!busy}
                            clickHendler={() => link.mutate(member.id)}
                        />
                        <AButton
                            title={TEXT.revoke}
                            size="xsmall"
                            color="danger"
                            isActive={!busy}
                            clickHendler={confirmThen(TEXT.revokeConfirm, () =>
                                revoke.mutate(member.id),
                            )}
                        />
                    </div>
                )}
            </td>
        </tr>
    );
};
