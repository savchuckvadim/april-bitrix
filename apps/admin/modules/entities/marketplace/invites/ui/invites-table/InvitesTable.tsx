'use client';

import * as React from 'react';
import { InviteDto } from '@workspace/nest-admin-api';
import { Button } from '@workspace/ui/components/button';
import { DataTable, Column } from '@/modules/shared';
import { Ban, RefreshCw, Trash2 } from 'lucide-react';
import { StatusBadge, StatusColor, formatDateTime } from '../../../shared';

interface InvitesTableProps {
    data: InviteDto[];
    isLoading?: boolean;
    onRevoke?: (item: InviteDto) => void;
    onReissue?: (item: InviteDto) => void;
    onDelete?: (item: InviteDto) => void;
}

/** Статус кода → цвет и русская подпись. */
const STATUS_VIEW: Record<string, { color: StatusColor; label: string }> = {
    issued: { color: 'yellow', label: 'Выпущен' },
    sent: { color: 'blue', label: 'Отправлен' },
    redeemed: { color: 'green', label: 'Погашен' },
    revoked: { color: 'red', label: 'Отозван' },
    expired: { color: 'gray', label: 'Истёк' },
};

/** Истёк ли срок действия кода (бэк переводит в expired лениво). */
function isExpired(invite: InviteDto): boolean {
    if (!invite.expiresAt) return false;
    const expires = new Date(invite.expiresAt).getTime();
    return !Number.isNaN(expires) && expires < Date.now();
}

/** Отозвать и перевыпустить можно только не погашенный и не отозванный код. */
function isActionable(invite: InviteDto): boolean {
    return invite.status === 'issued' || invite.status === 'sent';
}

/** Таблица кодов подключения портала. Самого кода тут нет — только префикс. */
export function InvitesTable({
    data,
    isLoading,
    onRevoke,
    onReissue,
    onDelete,
}: InvitesTableProps) {
    const columns: Column<InviteDto>[] = [
        {
            id: 'codePrefix',
            header: 'Код',
            cell: (row) => (
                <span className="font-mono text-xs">{row.codePrefix}…</span>
            ),
            className: 'w-28',
        },
        {
            id: 'email',
            header: 'Получатель',
            cell: (row) => <span className="font-medium">{row.email}</span>,
        },
        {
            id: 'organization',
            header: 'Организация',
            cell: (row) => row.organization || '—',
        },
        {
            id: 'status',
            header: 'Статус',
            cell: (row) => {
                const view = STATUS_VIEW[row.status] ?? {
                    color: 'gray' as StatusColor,
                    label: row.status,
                };
                // Срок вышел, но статус ещё не переписан фоном — показываем
                // фактическое состояние, иначе модератор ждёт погашения зря.
                const expiredNow = isActionable(row) && isExpired(row);
                return (
                    <StatusBadge
                        color={expiredNow ? 'gray' : view.color}
                        title={row.note}
                    >
                        {expiredNow ? 'Истёк' : view.label}
                    </StatusBadge>
                );
            },
            className: 'w-32',
        },
        {
            id: 'productCode',
            header: 'Продукт',
            cell: (row) => (
                <span title={
                    row.autoProvision
                        ? 'Установка запустится сразу при погашении'
                        : 'Установку запустит клиент кнопкой в кабинете'
                }>
                    {row.productCode}
                    {!row.autoProvision && (
                        <span className="text-muted-foreground"> (по кнопке)</span>
                    )}
                </span>
            ),
            className: 'w-36',
        },
        {
            id: 'expiresAt',
            header: 'Действует до',
            cell: (row) => formatDateTime(row.expiresAt),
            className: 'w-40',
        },
        {
            id: 'redeemedPortalDomain',
            header: 'Погасил портал',
            cell: (row) =>
                row.redeemedPortalDomain ? (
                    <span
                        className="text-xs"
                        title={formatDateTime(row.redeemedAt)}
                    >
                        {row.redeemedPortalDomain}
                    </span>
                ) : (
                    '—'
                ),
        },
        {
            id: 'issuedBy',
            header: 'Выдал',
            cell: (row) => (
                <span className="text-xs" title={formatDateTime(row.createdAt)}>
                    {row.issuedBy || '—'}
                </span>
            ),
            className: 'w-28',
        },
        {
            id: 'actions',
            header: '',
            cell: (row) => (
                <div className="flex gap-1">
                    {isActionable(row) && (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                title="Отправить новый код (старый перестанет действовать)"
                                onClick={() => onReissue?.(row)}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                title="Отозвать код"
                                onClick={() => onRevoke?.(row)}
                            >
                                <Ban className="h-4 w-4 text-red-600" />
                            </Button>
                        </>
                    )}
                    {/* удалять можно любой непогашенный: погашенный — аудит
                        подключения портала, бэк его тоже не удалит */}
                    {row.status !== 'redeemed' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            title="Удалить запись кода"
                            onClick={() => onDelete?.(row)}
                        >
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    )}
                </div>
            ),
            className: 'w-32',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Коды подключения не выпускались"
        />
    );
}
