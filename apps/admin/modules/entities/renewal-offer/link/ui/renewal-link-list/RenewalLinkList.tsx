'use client';

import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { RenewalLinkCreateDialog } from '../renewal-link-create-dialog/RenewalLinkCreateDialog';
import { RenewalLinkTable } from '../renewal-link-table/RenewalLinkTable';
import { useRenewalLinkList } from './hooks/use-renewal-link-list';

/**
 * Предложения на следующий год действующим клиентам: какие ссылки с какими
 * ценами выданы. Цены лежат на сервере, в адресе их нет — клиент не может
 * подменить стоимость. Отзыв закрывает предложение сразу у всех, кто
 * открыл его по этой ссылке.
 */
export function RenewalLinkList() {
    const list = useRenewalLinkList();

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">
                    Предложения на следующий год
                </h1>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => list.setCreateOpen(true)}>
                        Новое предложение
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={list.activeCount === 0}
                        onClick={() => list.setRevokeAllOpen(true)}
                    >
                        Отозвать все
                    </Button>
                </div>
            </div>

            <p className="max-w-3xl text-sm text-muted-foreground">
                Каждому клиенту — своя ссылка со своими ценами и составом
                услуг. По ссылке открывается предложение и PDF с теми же
                цифрами. Цены хранятся на сервере, поэтому изменить их в
                адресной строке нельзя.
            </p>

            {list.isError ? (
                <p className="text-sm text-destructive">
                    Не удалось загрузить список предложений.
                </p>
            ) : null}

            <RenewalLinkTable
                data={list.links}
                isLoading={list.isLoading}
                isCopied={list.isCopied}
                onCopy={list.copyLink}
                onRevoke={list.setLinkToRevoke}
            />

            <RenewalLinkCreateDialog
                open={list.isCreateOpen}
                onOpenChange={list.setCreateOpen}
            />

            <ConfirmDialog
                open={Boolean(list.linkToRevoke)}
                onOpenChange={open => {
                    if (!open) list.setLinkToRevoke(null);
                }}
                title="Отозвать предложение?"
                description={`Ссылка для «${list.linkToRevoke?.clientName ?? ''}» перестанет открываться. Вернуть её нельзя, понадобится новая.`}
                onConfirm={list.confirmRevoke}
                confirmLabel="Отозвать"
                variant="destructive"
                isLoading={list.isRevoking}
            />

            <ConfirmDialog
                open={list.isRevokeAllOpen}
                onOpenChange={list.setRevokeAllOpen}
                title="Отозвать все предложения?"
                description={`Действующих предложений: ${list.activeCount}. Все они перестанут открываться у клиентов. Вернуть их нельзя, понадобятся новые.`}
                onConfirm={list.confirmRevokeAll}
                confirmLabel="Отозвать все"
                variant="destructive"
                isLoading={list.isRevokingAll}
            />
        </div>
    );
}
