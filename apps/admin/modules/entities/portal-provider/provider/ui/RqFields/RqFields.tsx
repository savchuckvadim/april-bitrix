'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { useProviderEnums } from '../../lib/hooks';
import {
    PROVIDER_RQ_FIELDS,
    RQ_FIELD_GROUP_LABELS,
    type CreateRq,
    type RqFieldGroup,
} from '../../model';

/** Значения реквизитов в виде строковой карты (для контролируемых инпутов). */
export type RqFormValues = Record<string, string>;

const GROUP_ORDER: RqFieldGroup[] = [
    'main',
    'legal',
    'ip',
    'person',
    'contacts',
    'bank',
];

/**
 * Сетка полей реквизитов, сгруппированная по {@link RQ_FIELD_GROUP_LABELS}.
 * Поле `type` рендерится отдельным select`ом (значения из enums).
 */
export function RqFields({
    type,
    values,
    onTypeChange,
    onChange,
}: {
    type: string;
    values: RqFormValues;
    onTypeChange: (type: string) => void;
    onChange: (key: keyof CreateRq, value: string) => void;
}) {
    const enums = useProviderEnums();

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Label>Тип</Label>
                <Select value={type} onValueChange={onTypeChange}>
                    <SelectTrigger className="w-72">
                        <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                        {(enums.data?.types ?? []).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {GROUP_ORDER.map((group) => {
                const fields = PROVIDER_RQ_FIELDS.filter((f) => f.group === group);
                if (fields.length === 0) return null;
                return (
                    <fieldset key={group} className="space-y-3">
                        <legend className="text-sm font-semibold text-muted-foreground">
                            {RQ_FIELD_GROUP_LABELS[group]}
                        </legend>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {fields.map((field) => (
                                <div key={field.key} className="space-y-1">
                                    <Label htmlFor={`rq-${field.key}`}>
                                        {field.label}
                                    </Label>
                                    {field.multiline ? (
                                        <Textarea
                                            id={`rq-${field.key}`}
                                            value={values[field.key] ?? ''}
                                            onChange={(e) =>
                                                onChange(field.key, e.target.value)
                                            }
                                        />
                                    ) : (
                                        <Input
                                            id={`rq-${field.key}`}
                                            value={values[field.key] ?? ''}
                                            onChange={(e) =>
                                                onChange(field.key, e.target.value)
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </fieldset>
                );
            })}
        </div>
    );
}

/** Собрать payload реквизитов из формы, отбросив пустые строки. */
export function collectRqPayload(values: RqFormValues): Partial<CreateRq> {
    const out: Record<string, string> = {};
    for (const field of PROVIDER_RQ_FIELDS) {
        const v = values[field.key];
        if (v != null && v !== '') out[field.key] = v;
    }
    return out as Partial<CreateRq>;
}

/** Преобразовать слабо типизированные реквизиты бэка в строковую карту формы. */
export function rqToFormValues(rq: Record<string, unknown> | undefined): RqFormValues {
    const out: RqFormValues = {};
    if (!rq) return out;
    for (const field of PROVIDER_RQ_FIELDS) {
        const v = rq[field.key as string];
        out[field.key] = v == null ? '' : String(v);
    }
    return out;
}
