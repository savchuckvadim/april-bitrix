'use client';

import * as React from 'react';
import { InviteDto, IssueInviteDto, IssuedInviteDto } from '@workspace/nest-admin-api';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { ConfirmDialog } from '@/modules/shared';
import { Plus } from 'lucide-react';
import {
    useInvites,
    useIssueInvite,
    useReissueInvite,
    useRevokeInvite,
} from '../../lib/hooks/use-invites';
import { InvitesTable } from '../invites-table';
import { IssueInviteForm } from '../issue-invite-form';
import { IssuedCodeDialog } from '../issued-code-dialog';

/**
 * Раздел «Коды подключения»: список, выпуск, отзыв и перевыпуск.
 *
 * Выпуск и перевыпуск возвращают открытый код — он показывается в
 * IssuedCodeDialog один раз (в БД лежит только хэш).
 */
export function InvitesList() {
    const [emailFilter, setEmailFilter] = React.useState('');
    const [formOpen, setFormOpen] = React.useState(false);
    const [issued, setIssued] = React.useState<IssuedInviteDto | null>(null);
    const [toRevoke, setToRevoke] = React.useState<InviteDto | null>(null);
    const [toReissue, setToReissue] = React.useState<InviteDto | null>(null);

    const { data, isLoading } = useInvites(
        emailFilter ? { email: emailFilter } : undefined,
    );
    const issueInvite = useIssueInvite();
    const revokeInvite = useRevokeInvite();
    const reissueInvite = useReissueInvite();

    const handleIssue = (values: IssueInviteDto) => {
        issueInvite.mutate(values, {
            onSuccess: (result) => {
                setFormOpen(false);
                setIssued(result);
            },
        });
    };

    const confirmRevoke = () => {
        if (!toRevoke) return;
        revokeInvite.mutate(toRevoke.id, {
            onSuccess: () => setToRevoke(null),
        });
    };

    const confirmReissue = () => {
        if (!toReissue) return;
        reissueInvite.mutate(
            { id: toReissue.id, dto: {} },
            {
                onSuccess: (result) => {
                    setToReissue(null);
                    setIssued(result);
                },
            },
        );
    };

    return (
        <>
            <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Коды подключения</h1>
                {!formOpen && (
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Выпустить код
                    </Button>
                )}
            </div>

            {formOpen ? (
                <div className="mb-6">
                    <IssueInviteForm
                        onSubmit={handleIssue}
                        onCancel={() => setFormOpen(false)}
                        isLoading={issueInvite.isPending}
                        error={issueInvite.error}
                    />
                </div>
            ) : (
                <div className="mb-4 max-w-sm">
                    <Input
                        placeholder="Поиск по email получателя"
                        value={emailFilter}
                        onChange={(event) =>
                            setEmailFilter(event.target.value)
                        }
                    />
                </div>
            )}

            <InvitesTable
                data={Array.isArray(data) ? data : []}
                isLoading={isLoading}
                onRevoke={setToRevoke}
                onReissue={setToReissue}
            />

            <IssuedCodeDialog
                invite={issued}
                onClose={() => setIssued(null)}
            />

            <ConfirmDialog
                open={toRevoke !== null}
                onOpenChange={(open) => {
                    if (!open) setToRevoke(null);
                }}
                title="Отозвать код подключения?"
                description={`Код ${toRevoke?.codePrefix ?? ''}… для ${toRevoke?.email ?? ''} перестанет действовать — погасить его будет нельзя. Уже подключённые порталы это не затрагивает: их отключают блокировкой в разделе «Заявки».`}
                onConfirm={confirmRevoke}
                confirmLabel="Отозвать"
                variant="destructive"
                isLoading={revokeInvite.isPending}
            />

            <ConfirmDialog
                open={toReissue !== null}
                onOpenChange={(open) => {
                    if (!open) setToReissue(null);
                }}
                title="Отправить новый код?"
                description={`Прежний код ${toReissue?.codePrefix ?? ''}… будет отозван, а на ${toReissue?.email ?? ''} уйдёт новый. Повторно отправить прежний код невозможно — в базе хранится только его хэш.`}
                onConfirm={confirmReissue}
                confirmLabel="Перевыпустить"
                isLoading={reissueInvite.isPending}
            />
        </>
    );
}
