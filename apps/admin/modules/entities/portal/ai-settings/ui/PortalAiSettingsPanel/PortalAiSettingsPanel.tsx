'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { usePortal } from '@/modules/entities/portal/hooks';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { usePortalAiSettings, useSavePortalAiSettings } from '../../lib/hooks';
import {
    AI_LLM_MODELS,
    AI_MODEL_META,
    AI_SETTINGS_GROUPS,
    PortalAiSettings,
    PortalAiSettingsUpdate,
} from '../../model';
import { NumberField, TriStateField } from './components/SettingFields';

/** Сентинел селекта моделей: «как глобально» (Radix не принимает ''). */
const MODEL_GLOBAL = '__global__';

/** Черновик формы: числа — строками, пусто = «как глобально» (null). */
interface Draft {
    toggles: Record<string, boolean | null>;
    numbers: Record<string, string>;
    llmModel: string;
    deepAnalysisModel: string;
    allowedUserIds: string;
}

/** Серверные настройки → черновик формы. */
function toDraft(settings: PortalAiSettings | undefined): Draft {
    const numbers: Record<string, string> = {};
    const toggles: Record<string, boolean | null> = {};
    for (const group of AI_SETTINGS_GROUPS) {
        for (const meta of group.toggles) {
            toggles[meta.field] =
                (settings?.[meta.field] as boolean | null) ?? null;
        }
        for (const meta of group.numbers) {
            const value = settings?.[meta.field] as number | null | undefined;
            numbers[meta.field] = value == null ? '' : String(value);
        }
    }
    return {
        toggles,
        numbers,
        llmModel: settings?.llmModel ?? MODEL_GLOBAL,
        deepAnalysisModel: settings?.deepAnalysisModel ?? '',
        allowedUserIds: (settings?.allowedUserIds ?? []).join(', '),
    };
}

/**
 * Черновик → полный объект значений. Возвращает текст ошибки вместо
 * объекта, если значения невалидны. Границы чисел — зеркало валидации
 * бэка (meta.min/meta.max), чтобы админ получал русскую ошибку формы,
 * а не английский 400 class-validator.
 */
function toUpdate(draft: Draft): PortalAiSettingsUpdate | string {
    const update: Record<string, unknown> = { ...draft.toggles };

    for (const group of AI_SETTINGS_GROUPS) {
        for (const meta of group.numbers) {
            const raw = draft.numbers[meta.field]?.trim() ?? '';
            if (raw === '') {
                update[meta.field] = null;
                continue;
            }
            const value = Number(raw);
            const min = meta.min ?? 1;
            if (
                !Number.isInteger(value) ||
                value < min ||
                (meta.max != null && value > meta.max)
            ) {
                const range =
                    meta.max != null ? `${min}–${meta.max}` : `от ${min}`;
                return `«${meta.label}»: ожидается целое число ${range}, получено «${raw}»`;
            }
            update[meta.field] = value;
        }
    }

    // Ночное окно бэк принимает только целиком — проверяем до запроса.
    const nightStart = update.nightStartHour;
    const nightEnd = update.nightEndHour;
    if ((nightStart === null) !== (nightEnd === null)) {
        return 'Ночное окно задаётся целиком: укажите и начало, и конец, либо очистите оба поля';
    }

    update.llmModel = draft.llmModel === MODEL_GLOBAL ? null : draft.llmModel;
    update.deepAnalysisModel = draft.deepAnalysisModel.trim() || null;

    const usersRaw = draft.allowedUserIds.trim();
    if (usersRaw === '') {
        update.allowedUserIds = null;
    } else {
        const ids = usersRaw
            .split(/[,\s]+/)
            .filter(Boolean)
            .map((part) => Number(part));
        if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
            return `ДЕМО-сотрудники: ожидаются bitrix-id через запятую, получено «${usersRaw}»`;
        }
        update.allowedUserIds = ids;
    }

    return update as PortalAiSettingsUpdate;
}

/**
 * Частичный PUT: только поля, отличающиеся от серверного снимка. Так
 * контракт «отсутствующее поле не трогается» работает по назначению, и
 * сохранение никогда не сбрасывает то, что админ не менял.
 */
function diffUpdate(
    full: PortalAiSettingsUpdate,
    server: PortalAiSettingsUpdate,
): PortalAiSettingsUpdate {
    const changed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(full)) {
        const serverValue = (server as Record<string, unknown>)[key];
        if (JSON.stringify(value) !== JSON.stringify(serverValue)) {
            changed[key] = value;
        }
    }
    return changed as PortalAiSettingsUpdate;
}

/** Шапка: домен, статус главного выключателя, время последнего скана. */
function StatusHeader({
    domain,
    settings,
}: {
    domain: string | undefined;
    settings: PortalAiSettings | undefined;
}) {
    const enabled = settings?.enabled ?? null;
    return (
        <div>
            <h1 className="text-2xl font-bold">Настройки AI</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Портал: {domain ?? '…'}</span>
                {enabled === true && <Badge>конвейер включён</Badge>}
                {enabled === false && (
                    <Badge variant="destructive">конвейер выключен</Badge>
                )}
                {enabled === null && (
                    <Badge variant="outline">по env-списку приложения</Badge>
                )}
                {settings?.lastScanAt && (
                    <span>
                        Последний скан:{' '}
                        {new Date(settings.lastScanAt).toLocaleString('ru-RU')}
                    </span>
                )}
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Каждый показатель переопределяет глобальную настройку
                приложения только для этого портала. «Как глобально» / пустое
                поле — портал работает на общих значениях (env event-sales);
                любые изменения применяются со следующего тика планировщика,
                без деплоя. Всё это работает при включённом глобальном кроне
                приложения (CALL_REPORT_CRON_ENABLED=1) — портальный
                выключатель его не заменяет.
            </p>
        </div>
    );
}

export function PortalAiSettingsPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const settings = usePortalAiSettings(portalId);
    const save = useSavePortalAiSettings();

    const [draft, setDraft] = React.useState<Draft>(() => toDraft(undefined));
    // Предыдущий серверный снимок: по нему отличаем «админ ничего не менял»
    // от «есть несохранённые правки» при фоновом refetch.
    const prevServerJson = React.useRef<string | null>(null);

    // Черновик пересобирается из ответа сервера ТОЛЬКО пока он чист:
    // фоновый refetch (фокус окна, обновлённый lastScanAt) не должен
    // молча стирать несохранённые правки админа.
    React.useEffect(() => {
        if (!settings.data) return;
        const next = toDraft(settings.data);
        const nextJson = JSON.stringify(next);
        setDraft((prev) => {
            const wasClean =
                prevServerJson.current === null ||
                JSON.stringify(prev) === prevServerJson.current;
            prevServerJson.current = nextJson;
            return wasClean ? next : prev;
        });
    }, [settings.data]);

    const dirty =
        JSON.stringify(draft) !== JSON.stringify(toDraft(settings.data));

    // Незнакомая модель из БД не должна пропадать из селекта (и теряться
    // при первом же сохранении) — показываем её отдельной опцией.
    const llmOptions: string[] = [...AI_LLM_MODELS];
    if (
        draft.llmModel !== MODEL_GLOBAL &&
        !llmOptions.includes(draft.llmModel)
    ) {
        llmOptions.push(draft.llmModel);
    }

    const submit = () => {
        const update = toUpdate(draft);
        if (typeof update === 'string') {
            toast.error(update);
            return;
        }
        const serverUpdate = toUpdate(toDraft(settings.data));
        const changed =
            typeof serverUpdate === 'string'
                ? update
                : diffUpdate(update, serverUpdate);
        if (Object.keys(changed).length === 0) return;
        if (
            (changed.nightStartHour !== undefined ||
                changed.nightEndHour !== undefined) &&
            update.nightStartHour != null &&
            update.nightScanIntervalMinutes == null
        ) {
            toast.info(
                'Ночное окно задано без «Интервала ночью» — пока интервал пуст, окно ничего не меняет',
            );
        }
        save.mutate({ portalId, update: changed });
    };

    if (settings.isLoading) {
        return <p className="text-sm text-muted-foreground">Загрузка…</p>;
    }

    // Без серверного снимка форму не показываем: сохранение «вслепую»
    // сбрасывало бы переопределения, которых админ не видел.
    if (settings.isError || !settings.data) {
        return (
            <div className="space-y-3">
                <h1 className="text-2xl font-bold">Настройки AI</h1>
                <p className="text-sm text-destructive">
                    Не удалось загрузить настройки портала — форма недоступна,
                    чтобы случайно не затереть текущие значения.
                </p>
                <Button variant="outline" onClick={() => void settings.refetch()}>
                    Повторить загрузку
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <StatusHeader domain={portal.data?.domain} settings={settings.data} />

            {AI_SETTINGS_GROUPS.map((group) => (
                <Card key={group.title}>
                    <CardHeader>
                        <CardTitle>{group.title}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {group.toggles.map((meta) => (
                                <TriStateField
                                    key={meta.field}
                                    label={meta.label}
                                    description={meta.description}
                                    globalHint={meta.globalHint}
                                    value={draft.toggles[meta.field] ?? null}
                                    onChange={(value) =>
                                        setDraft((d) => ({
                                            ...d,
                                            toggles: {
                                                ...d.toggles,
                                                [meta.field]: value,
                                            },
                                        }))
                                    }
                                />
                            ))}
                            {group.numbers.map((meta) => (
                                <NumberField
                                    key={meta.field}
                                    label={meta.label}
                                    description={meta.description}
                                    globalHint={meta.globalHint}
                                    value={draft.numbers[meta.field] ?? ''}
                                    onChange={(value) =>
                                        setDraft((d) => ({
                                            ...d,
                                            numbers: {
                                                ...d.numbers,
                                                [meta.field]: value,
                                            },
                                        }))
                                    }
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Card>
                <CardHeader>
                    <CardTitle>Модели и ДЕМО-режим</CardTitle>
                    <CardDescription>
                        Какие модели анализируют звонки и не сузить ли пилот до
                        отдельных сотрудников.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-1">
                            <Label>{AI_MODEL_META.llmModel.label}</Label>
                            <Select
                                value={draft.llmModel}
                                onValueChange={(value) =>
                                    setDraft((d) => ({ ...d, llmModel: value }))
                                }
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={MODEL_GLOBAL}>
                                        Как глобально
                                    </SelectItem>
                                    {llmOptions.map((model) => (
                                        <SelectItem key={model} value={model}>
                                            {model}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                {AI_MODEL_META.llmModel.description}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                                {AI_MODEL_META.llmModel.globalHint}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label>{AI_MODEL_META.deepAnalysisModel.label}</Label>
                            <Input
                                value={draft.deepAnalysisModel}
                                placeholder="bitrix/bitrixgpt-5.5"
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        deepAnalysisModel: e.target.value,
                                    }))
                                }
                                className="w-56"
                            />
                            <p className="text-sm text-muted-foreground">
                                {AI_MODEL_META.deepAnalysisModel.description}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                                {AI_MODEL_META.deepAnalysisModel.globalHint}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <Label>{AI_MODEL_META.allowedUserIds.label}</Label>
                            <Input
                                value={draft.allowedUserIds}
                                placeholder="например: 222, 323"
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        allowedUserIds: e.target.value,
                                    }))
                                }
                                className="w-56"
                            />
                            <p className="text-sm text-muted-foreground">
                                {AI_MODEL_META.allowedUserIds.description}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                                {AI_MODEL_META.allowedUserIds.globalHint}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3">
                {dirty && (
                    <span className="text-sm text-muted-foreground">
                        Есть несохранённые изменения
                    </span>
                )}
                <Button onClick={submit} disabled={save.isPending || !dirty}>
                    {save.isPending ? 'Сохранение…' : 'Сохранить настройки'}
                </Button>
            </div>
        </div>
    );
}
