'use client';

import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { PublicLinkCreateDialog } from '../public-link-create-dialog/PublicLinkCreateDialog';
import { PublicLinkTable } from '../public-link-table/PublicLinkTable';
import { usePublicLinkList } from './hooks/use-public-link-list';

/**
 * Публичные ссылки на конструктор: для сотрудников, которые смотрят правила
 * формирования комплектов. Отзыв закрывает страницу сразу у всех, кто открыл её
 * по этой ссылке.
 */
export function PublicLinkList() {
    const list = usePublicLinkList();

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">Публичные ссылки</h1>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => list.setCreateOpen(true)}>
                        Создать ссылку
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
                По ссылке открывается сборка комплекта без Битрикса: каталог выбранного
                портала, наполнение и правила. КП и документы не формируются, описание
                комплекта скачать можно. Прайс виден всем, у кого есть ссылка.
            </p>

            {list.isError ? (
                <p className="text-sm text-destructive">
                    Не удалось загрузить список ссылок.
                </p>
            ) : null}

            <PublicLinkTable
                data={list.links}
                isLoading={list.isLoading}
                isCopied={list.isCopied}
                onCopy={list.copyLink}
                onRevoke={list.setLinkToRevoke}
            />

            <PublicLinkCreateDialog
                open={list.isCreateOpen}
                onOpenChange={list.setCreateOpen}
            />

            <ConfirmDialog
                open={Boolean(list.linkToRevoke)}
                onOpenChange={open => {
                    if (!open) list.setLinkToRevoke(null);
                }}
                title="Отозвать ссылку?"
                description={`Ссылка «${list.linkToRevoke?.title ?? ''}» перестанет открываться. Вернуть её нельзя, понадобится новая.`}
                onConfirm={list.confirmRevoke}
                confirmLabel="Отозвать"
                variant="destructive"
                isLoading={list.isRevoking}
            />

            <ConfirmDialog
                open={list.isRevokeAllOpen}
                onOpenChange={list.setRevokeAllOpen}
                title="Отозвать все ссылки?"
                description={`Действующих ссылок: ${list.activeCount}. Публичный конструктор перестанет открываться для всех. Вернуть их нельзя, понадобятся новые.`}
                onConfirm={list.confirmRevokeAll}
                confirmLabel="Отозвать все"
                variant="destructive"
                isLoading={list.isRevokingAll}
            />
        </div>
    );
}
