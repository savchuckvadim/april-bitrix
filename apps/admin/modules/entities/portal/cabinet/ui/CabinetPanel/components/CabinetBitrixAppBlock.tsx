'use client';

import { useState } from 'react';
import { ABadge, AButton, AInput } from '@workspace/april-ui';
import {
    useCabinetBitrixApp,
    useCheckCabinetBitrixApp,
    useSaveCabinetBitrixAppKeys,
} from '../../../lib/hooks/use-cabinet-bitrix-app';
import type { CabinetBitrixAppConnection } from '../../../model';

type Field = 'clientId' | 'clientSecret';
const EMPTY: Record<Field, string> = { clientId: '', clientSecret: '' };

const when = (iso: string | null): string =>
    iso ? new Date(iso).toLocaleString('ru-RU') : '—';

/** Строка «что ввести в Битрикс24» с копированием — переслать клиенту. */
const CopyRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <code className="rounded bg-muted px-1 text-xs">{value}</code>
        <button
            type="button"
            className="text-xs text-primary underline underline-offset-2"
            onClick={() => void navigator.clipboard.writeText(value)}
        >
            скопировать
        </button>
    </div>
);

const Status = ({ data }: { data: CabinetBitrixAppConnection }) => (
    <div className="flex flex-wrap items-center gap-2 text-sm">
        <ABadge
            title={data.keys.set ? `ключи: ${data.keys.clientId ?? ''}` : 'ключи не внесены'}
            size="small"
            color={data.keys.set ? 'green' : 'warning'}
        />
        <ABadge
            title={data.install.installed ? `установлено ${when(data.install.installedAt)}` : 'не установлено'}
            size="small"
            color={data.install.installed ? 'green' : 'grey'}
        />
        {data.lastRefresh && (
            <ABadge
                title={`токен ${data.lastRefresh.ok ? 'обновлён' : 'НЕ обновился'} ${when(data.lastRefresh.at)}`}
                size="small"
                color={data.lastRefresh.ok ? 'green' : 'warning'}
            />
        )}
    </div>
);

/**
 * «Подключение Битрикс24» в карточке портала: ключи локального приложения
 * (April вносит их за клиента), адреса для Битрикс24 — переслать клиенту,
 * проверка ключей пробным обновлением токена. Клиент-владелец видит то же
 * в своём кабинете.
 */
export const CabinetBitrixAppBlock = ({ portalId }: { portalId: number }) => {
    const { data, isError } = useCabinetBitrixApp(portalId);
    const save = useSaveCabinetBitrixAppKeys(portalId);
    const check = useCheckCabinetBitrixApp(portalId);
    const [form, setForm] = useState(EMPTY);
    const set = (name: Field, value: string) => setForm(prev => ({ ...prev, [name]: value }));

    if (isError) return <p className="text-sm text-destructive">Подключение Битрикс24 не загрузилось</p>;
    if (!data) return null;

    const submit = () =>
        save.mutate(
            { clientId: form.clientId.trim(), clientSecret: form.clientSecret.trim() },
            { onSuccess: () => setForm(EMPTY) },
        );

    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Подключение Битрикс24 (локальное приложение)</h4>
            <Status data={data} />
            {data.lastRefresh && !data.lastRefresh.ok && data.lastRefresh.error && (
                <p className="text-xs text-destructive">Ответ Битрикса: {data.lastRefresh.error}</p>
            )}

            <details className="rounded-md border p-3">
                <summary className="cursor-pointer text-sm">Что ввести в Битрикс24 (переслать клиенту)</summary>
                <div className="mt-2 flex flex-col gap-1">
                    <CopyRow label="Раздел:" value={data.setup.devSectionUrl} />
                    <CopyRow label="Путь обработчика:" value={data.setup.handlerUrl} />
                    <CopyRow label="Путь установки:" value={data.setup.installUrl} />
                    <CopyRow label="Права:" value={data.setup.scopes.join(', ')} />
                    <p className="text-xs text-muted-foreground">
                        Тип «Серверное», галка «Использует только API» снята. Владелец видит эту же инструкцию в своём
                        кабинете и может внести ключи сам.
                    </p>
                </div>
            </details>

            <div className="grid gap-3 md:grid-cols-2">
                <AInput<Field>
                    label={data.keys.set ? 'Новый client_id' : 'client_id (local.…)'}
                    errorMessage={null}
                    nameForHandler="clientId"
                    value={form.clientId}
                    autoComplete="off"
                    handleChange={set}
                    handleOnFocus={() => save.reset()}
                />
                <AInput<Field>
                    label="client_secret"
                    errorMessage={null}
                    nameForHandler="clientSecret"
                    value={form.clientSecret}
                    type="password"
                    autoComplete="off"
                    handleChange={set}
                    handleOnFocus={() => save.reset()}
                />
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <div className="w-44">
                    <AButton
                        title={save.isPending ? 'Сохраняем…' : 'Сохранить ключи'}
                        size="small"
                        isActive={!save.isPending && !!form.clientId.trim() && !!form.clientSecret.trim()}
                        clickHendler={submit}
                    />
                </div>
                <div className="w-48">
                    <AButton
                        title={check.isPending ? 'Проверяем…' : 'Проверить подключение'}
                        size="small"
                        color="grey"
                        isActive={!check.isPending}
                        clickHendler={() => check.mutate()}
                    />
                </div>
                {check.data && (
                    <span className={check.data.result === 'ok' ? 'text-sm' : 'text-sm text-destructive'}>
                        {check.data.message}
                    </span>
                )}
            </div>
        </div>
    );
};
