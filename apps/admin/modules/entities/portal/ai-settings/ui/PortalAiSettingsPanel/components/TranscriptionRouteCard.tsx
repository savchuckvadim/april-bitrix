'use client';

import * as React from 'react';
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
import { Switch } from '@workspace/ui/components/switch';
import {
    ROUTE_MAX_FALLBACKS,
    ROUTE_NOT_SET,
    ROUTE_PRIORITY_OPTIONS,
    ROUTE_PROVIDER_OPTIONS,
    ROUTE_ROLES,
    emptyRouteSlot,
    routeSlotHasModel,
    type RoutePriority,
    type RouteSlotDraft,
    type TranscriptionRouteDraft,
} from '../../../lib/transcription-route';

/** Транскрибатор и модель одной роли. */
function SlotField({
    value,
    notSetLabel,
    onChange,
}: {
    value: RouteSlotDraft;
    notSetLabel: string;
    onChange: (value: RouteSlotDraft) => void;
}) {
    const option = ROUTE_PROVIDER_OPTIONS.find(o => o.value === value.provider);
    return (
        <div className="flex flex-wrap gap-2">
            <Select
                value={value.provider}
                onValueChange={provider => onChange({ ...value, provider })}
            >
                <SelectTrigger className="w-64">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ROUTE_NOT_SET}>{notSetLabel}</SelectItem>
                    {ROUTE_PROVIDER_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                            {o.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {routeSlotHasModel(value.provider) && (
                <Input
                    className="w-72"
                    value={value.model}
                    placeholder={
                        option?.modelPlaceholder ?? 'модель по умолчанию'
                    }
                    onChange={event =>
                        onChange({ ...value, model: event.target.value })
                    }
                />
            )}
        </div>
    );
}

interface TranscriptionRouteCardProps {
    draft: TranscriptionRouteDraft;
    onChange: (patch: Partial<TranscriptionRouteDraft>) => void;
}

/**
 * Карточка «Кто распознаёт звонки»: роли поверх режима «Транскрибатор» —
 * длинные, короткие, запасные, для скорости и для точности (решение
 * владельца 10.11.2026). Пустая роль — как в режиме. Сохраняется общей
 * кнопкой страницы.
 */
export function TranscriptionRouteCard({
    draft,
    onChange,
}: TranscriptionRouteCardProps) {
    const priority = ROUTE_PRIORITY_OPTIONS.find(
        o => o.value === draft.priority,
    );
    const setFallback = (index: number, slot: RouteSlotDraft) =>
        onChange({
            fallbacks: draft.fallbacks.map((item, i) =>
                i === index ? slot : item,
            ),
        });
    return (
        <Card>
            <CardHeader>
                <CardTitle>Кто распознаёт звонки</CardTitle>
                <CardDescription>
                    Здесь можно назначить, кто переводит запись в текст:
                    отдельно для длинных и коротких звонков, кто подхватывает,
                    если основной не ответил, и кого брать, когда важнее
                    скорость или точность. Не заданная роль работает так, как
                    выбрано в поле «Транскрибатор» выше. Изменения действуют в
                    течение минуты, без выкладки.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Что сейчас важнее</Label>
                        <Select
                            value={draft.priority}
                            onValueChange={value =>
                                onChange({ priority: value as RoutePriority })
                            }
                        >
                            <SelectTrigger className="w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ROUTE_PRIORITY_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            {priority?.hint}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <Label>Длинный звонок — от, секунд</Label>
                        <Input
                            className="w-40"
                            inputMode="numeric"
                            value={draft.longMinSec}
                            placeholder="600"
                            onChange={event =>
                                onChange({ longMinSec: event.target.value })
                            }
                        />
                        <p className="text-sm text-muted-foreground">
                            Звонок не короче этого числа считается длинным.
                            Пусто — как в приложении, обычно 10 минут.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {ROUTE_ROLES.map(({ role, label, hint }) => (
                        <div key={role} className="space-y-1">
                            <Label>{label}</Label>
                            <SlotField
                                value={draft[role]}
                                notSetLabel="Как в режиме"
                                onChange={slot => onChange({ [role]: slot })}
                            />
                            <p className="text-sm text-muted-foreground">
                                {hint}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={draft.customFallbacks}
                            onCheckedChange={customFallbacks =>
                                onChange({ customFallbacks })
                            }
                        />
                        <Label>Свой список запасных</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {draft.customFallbacks
                            ? 'Если основной не ответил, звонок по очереди получают запасные из списка. Пустой список — запасных нет: звонок без текста дождётся следующей попытки.'
                            : 'Выключено: запасные как в режиме — если основной не ответил, пробуем остальных.'}
                    </p>
                    {draft.customFallbacks && (
                        <div className="space-y-2">
                            {draft.fallbacks.map((slot, index) => (
                                <div
                                    key={index}
                                    className="flex flex-wrap items-center gap-2"
                                >
                                    <span className="w-6 text-sm text-muted-foreground">
                                        {index + 1}.
                                    </span>
                                    <SlotField
                                        value={slot}
                                        notSetLabel="Не задан"
                                        onChange={next =>
                                            setFallback(index, next)
                                        }
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            onChange({
                                                fallbacks:
                                                    draft.fallbacks.filter(
                                                        (_, i) => i !== index,
                                                    ),
                                            })
                                        }
                                    >
                                        Убрать
                                    </Button>
                                </div>
                            ))}
                            {draft.fallbacks.length < ROUTE_MAX_FALLBACKS && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        onChange({
                                            fallbacks: [
                                                ...draft.fallbacks,
                                                emptyRouteSlot(),
                                            ],
                                        })
                                    }
                                >
                                    Добавить запасной
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
