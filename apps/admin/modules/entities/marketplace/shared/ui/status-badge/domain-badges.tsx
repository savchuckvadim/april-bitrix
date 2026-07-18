'use client';

import * as React from 'react';
import { InstallComponentDto } from '@workspace/nest-admin-api';
import { StatusBadge, StatusColor } from './StatusBadge';
import { formatDateTime, isTokenExpired } from '../../lib/format';

/** Бейдж статуса допуска портала (pending | approved | blocked). */
export function ApprovalStatusBadge({ status }: { status?: string }) {
    const map: Record<string, { color: StatusColor; label: string }> = {
        pending: { color: 'yellow', label: 'Ожидает' },
        approved: { color: 'green', label: 'Одобрен' },
        blocked: { color: 'red', label: 'Заблокирован' },
    };
    const item = status ? map[status] : undefined;
    if (!item) return <StatusBadge color="gray">{status || '—'}</StatusBadge>;
    return <StatusBadge color={item.color}>{item.label}</StatusBadge>;
}

const INSTALL_STATUS_LABELS: Record<string, { color: StatusColor; label: string }> = {
    pending: { color: 'gray', label: 'Ожидает' },
    tokens_stored: { color: 'blue', label: 'Токены сохранены' },
    events_bound: { color: 'blue', label: 'События привязаны' },
    placements_bound: { color: 'blue', label: 'Виджеты привязаны' },
    provisioning: { color: 'blue', label: 'Установка сущностей' },
    installed: { color: 'green', label: 'Установлено' },
    error: { color: 'red', label: 'Ошибка' },
};

/** Бейдж статуса установки приложения (install_status). */
export function InstallStatusBadge({ status, title }: { status?: string; title?: string }) {
    if (!status) return <StatusBadge color="gray">—</StatusBadge>;
    const item = INSTALL_STATUS_LABELS[status];
    if (!item) return <StatusBadge color="gray" title={title}>{status}</StatusBadge>;
    return <StatusBadge color={item.color} title={title}>{item.label}</StatusBadge>;
}

/** Бейдж статуса продукта портала (active | inactive | suspended). */
export function ProductStatusBadge({ status }: { status?: string }) {
    const map: Record<string, { color: StatusColor; label: string }> = {
        active: { color: 'green', label: 'Активен' },
        inactive: { color: 'gray', label: 'Неактивен' },
        suspended: { color: 'red', label: 'Приостановлен' },
    };
    const item = status ? map[status] : undefined;
    if (!item) return <StatusBadge color="gray">{status || '—'}</StatusBadge>;
    return <StatusBadge color={item.color}>{item.label}</StatusBadge>;
}

/** Бейдж статуса обработки события журнала (received | processed | error). */
export function EventStatusBadge({ status, title }: { status?: string; title?: string }) {
    const map: Record<string, { color: StatusColor; label: string }> = {
        processed: { color: 'green', label: 'Обработано' },
        received: { color: 'gray', label: 'Получено' },
        error: { color: 'red', label: 'Ошибка' },
    };
    const item = status ? map[status] : undefined;
    if (!item) return <StatusBadge color="gray" title={title}>{status || '—'}</StatusBadge>;
    return <StatusBadge color={item.color} title={title}>{item.label}</StatusBadge>;
}

interface TokenStateBadgeProps {
    tokenExpiresAt?: string;
    hasRefreshToken: boolean;
}

/**
 * Диагностика access_token установки: срок жизни + признак refresh_token.
 * Истёкший токен при наличии refresh — «спящий» портал (серый бейдж).
 */
export function TokenStateBadge({ tokenExpiresAt, hasRefreshToken }: TokenStateBadgeProps) {
    const expiresText = formatDateTime(tokenExpiresAt);

    if (!tokenExpiresAt) {
        return <StatusBadge color="gray" title="Токен установки отсутствует">Нет токена</StatusBadge>;
    }

    const expired = isTokenExpired(tokenExpiresAt);

    if (expired && hasRefreshToken) {
        return (
            <StatusBadge
                color="gray"
                title={`Токен истёк ${expiresText}, есть refresh_token — портал «спит», возможен фоновый рефреш`}
            >
                Спит
            </StatusBadge>
        );
    }
    if (expired) {
        return (
            <StatusBadge color="red" title={`Токен истёк ${expiresText}, refresh_token отсутствует`}>
                Токен истёк
            </StatusBadge>
        );
    }
    return (
        <StatusBadge
            color="green"
            title={hasRefreshToken ? 'Есть refresh_token' : 'Refresh_token отсутствует'}
        >
            до {expiresText}
        </StatusBadge>
    );
}

const SKIP_REASON_LABELS: Record<string, string> = {
    tariff_restricted: 'Недоступно на тарифе',
    bitrix_archive: 'Ставит Битрикс',
    awaiting_approval: 'После одобрения',
};

/** Бейдж статуса компонента установки (installed/installing/pending/error/skipped/unavailable). */
export function ComponentStatusBadge({ component }: { component: InstallComponentDto }) {
    const { status, reasonCode, errorDetail } = component;

    switch (status) {
        case 'installed':
            return <StatusBadge color="green">Установлен</StatusBadge>;
        case 'installing':
            return <StatusBadge color="blue">Устанавливается</StatusBadge>;
        case 'pending':
            return <StatusBadge color="gray">Ожидает</StatusBadge>;
        case 'error':
            return (
                <StatusBadge color="red" title={errorDetail || 'Ошибка установки компонента'}>
                    Ошибка
                </StatusBadge>
            );
        case 'skipped': {
            const label =
                (reasonCode && SKIP_REASON_LABELS[reasonCode]) ||
                (reasonCode ? `Пропущен (${reasonCode})` : 'Пропущен');
            return <StatusBadge color="gray" title={reasonCode}>{label}</StatusBadge>;
        }
        case 'unavailable':
            return <StatusBadge color="gray" title={reasonCode}>Недоступен</StatusBadge>;
        default:
            return <StatusBadge color="gray" title={errorDetail || reasonCode}>{status}</StatusBadge>;
    }
}
