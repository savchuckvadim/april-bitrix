'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import type { AdminPortalResponseDto } from '@workspace/nest-admin-api';
import {
    AUTH_MODE_TITLE,
    useCabinetBitrixApp,
    useCabinetCard,
    useCheckCabinetBitrixApp,
} from '@/modules/entities/portal/cabinet';

const PART_TITLE: Record<string, string> = { sales: 'Отдел продаж', service: 'Отдел сервиса' };

const when = (iso: string | null | undefined): string =>
    iso ? new Date(iso).toLocaleString('ru-RU') : '—';

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b py-1.5 text-sm last:border-b-0">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-right">{children}</span>
    </div>
);

/**
 * Как April ходит в портал: режим авторизации, вебхук, локальное
 * приложение (ключи, установка, обновление токена) и живая проверка.
 */
export const ConnectionCard = ({ portal }: { portal: AdminPortalResponseDto }) => {
    const app = useCabinetCard(portal.id).data?.app;
    const connection = useCabinetBitrixApp(portal.id).data;
    const check = useCheckCabinetBitrixApp(portal.id);
    const last = connection?.lastRefresh;

    return (
        <SectionCard
            title="Подключение к Битрикс24"
            description="Чем April ходит в портал и обновляется ли доступ."
            actions={
                <Button size="sm" variant="outline" disabled={check.isPending} onClick={() => check.mutate()}>
                    {check.isPending ? 'Проверяю…' : 'Проверить подключение'}
                </Button>
            }
        >
            <Row label="Бэкенд ходит в портал">
                {app ? (AUTH_MODE_TITLE[app.bitrixAuthMode] ?? app.bitrixAuthMode) : '…'}
            </Row>
            <Row label="Вебхук портала">
                <ToneBadge tone={portal.C_REST_WEB_HOOK_URL ? 'success' : 'muted'} size="sm">
                    {portal.C_REST_WEB_HOOK_URL ? 'задан' : 'нет'}
                </ToneBadge>
            </Row>
            <Row label="Части приложения">
                {app?.enabledParts.length ? app.enabledParts.map(part => PART_TITLE[part] ?? part).join(', ') : 'не выбраны'}
            </Row>
            <Row label="Ключи локального приложения">
                {connection ? (
                    <ToneBadge tone={connection.keys.set ? 'success' : 'warning'} size="sm">
                        {connection.keys.set ? connection.keys.clientId ?? 'внесены' : 'не внесены'}
                    </ToneBadge>
                ) : (
                    '…'
                )}
            </Row>
            <Row label="Установка">
                {connection?.install.installed ? `установлено ${when(connection.install.installedAt)}` : 'не установлено'}
            </Row>
            <Row label="Обновление токена">
                {last ? (
                    <ToneBadge tone={last.ok ? 'success' : 'destructive'} size="sm">
                        {last.ok ? 'работает' : 'ошибка'} · {when(last.at)}
                    </ToneBadge>
                ) : (
                    'ещё не было'
                )}
            </Row>
            {last && !last.ok && last.error && (
                <p className="mt-2 text-xs text-destructive">Ответ Битрикса: {last.error}</p>
            )}
            {check.data && (
                <p className={check.data.result === 'ok' ? 'mt-2 text-sm' : 'mt-2 text-sm text-destructive'}>
                    {check.data.message}
                </p>
            )}
            <Link href={`/portal/${portal.id}/cabinet`} className="mt-2 inline-block text-sm text-primary hover:underline">
                Ключи и виджеты — во вкладке «Кабинет»
            </Link>
        </SectionCard>
    );
};
