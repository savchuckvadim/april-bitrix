'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { AI_LLM_PROVIDER_OPTIONS, AI_PROVIDERS_META } from '../../../model';

/** Подпись поля: описание и что действует, пока поле не задано. */
function FieldHints({
    description,
    globalHint,
}: {
    description: string;
    globalHint: string;
}) {
    return (
        <>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground/80">{globalHint}</p>
        </>
    );
}

const labelOf = (code: string): string =>
    AI_LLM_PROVIDER_OPTIONS.find((option) => option.value === code)?.label ??
    code;

/**
 * Порядок провайдеров LLM: упорядоченный список с кнопками «выше / ниже /
 * убрать» и селектом добавления. Пустой список = «как в приложении» (null).
 */
export function ProviderOrderField({
    value,
    onChange,
}: {
    value: string[];
    onChange: (value: string[]) => void;
}) {
    const meta = AI_PROVIDERS_META.llmProviderOrder;
    const rest = AI_LLM_PROVIDER_OPTIONS.filter(
        (option) => !value.includes(option.value),
    );
    const move = (index: number, delta: -1 | 1) => {
        const target = index + delta;
        if (target < 0 || target >= value.length) return;
        const next = [...value];
        [next[index], next[target]] = [next[target] as string, next[index] as string];
        onChange(next);
    };

    return (
        <div className="space-y-2">
            <Label>{meta.label}</Label>
            {value.length === 0 ? (
                <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    Как в приложении — порядок не переопределён.
                </p>
            ) : (
                <ol className="space-y-1">
                    {value.map((code, index) => (
                        <li
                            key={code}
                            className="flex items-center gap-2 rounded-md border px-2 py-1 text-sm"
                        >
                            <span className="w-5 text-muted-foreground">
                                {index + 1}.
                            </span>
                            <span className="flex-1">
                                {labelOf(code)}
                                {index === 0 && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        основной
                                    </span>
                                )}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label="Выше"
                                disabled={index === 0}
                                onClick={() => move(index, -1)}
                            >
                                ↑
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label="Ниже"
                                disabled={index === value.length - 1}
                                onClick={() => move(index, 1)}
                            >
                                ↓
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label="Убрать из порядка"
                                onClick={() =>
                                    onChange(value.filter((c) => c !== code))
                                }
                            >
                                ✕
                            </Button>
                        </li>
                    ))}
                </ol>
            )}
            <div className="flex flex-wrap items-center gap-2">
                {rest.length > 0 && (
                    <Select
                        value=""
                        onValueChange={(code) => onChange([...value, code])}
                    >
                        <SelectTrigger className="w-72">
                            <SelectValue placeholder="Добавить провайдера…" />
                        </SelectTrigger>
                        <SelectContent>
                            {rest.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                {value.length > 0 && (
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0"
                        onClick={() => onChange([])}
                    >
                        Сбросить: как в приложении
                    </Button>
                )}
            </div>
            <FieldHints
                description={meta.description}
                globalHint={meta.globalHint}
            />
            <ul className="space-y-0.5 text-xs text-muted-foreground/80">
                {AI_LLM_PROVIDER_OPTIONS.map((option) => (
                    <li key={option.value}>
                        <span className="text-muted-foreground">{option.label}</span>
                        {' — '}
                        {option.hint}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Текстовое поле блока провайдеров: пусто = «как в приложении». */
export function ProviderTextField({
    meta,
    value,
    placeholder,
    onChange,
    secret = false,
}: {
    meta: { label: string; description: string; globalHint: string };
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    /** Ключ: без автозаполнения браузера, маска из ответа показывается как есть. */
    secret?: boolean;
}) {
    return (
        <div className="space-y-1">
            <Label>{meta.label}</Label>
            <Input
                type="text"
                autoComplete={secret ? 'off' : undefined}
                spellCheck={false}
                value={value}
                placeholder={placeholder ?? 'как в приложении'}
                onChange={(e) => onChange(e.target.value)}
                className="w-full max-w-md"
            />
            <FieldHints
                description={meta.description}
                globalHint={meta.globalHint}
            />
        </div>
    );
}
