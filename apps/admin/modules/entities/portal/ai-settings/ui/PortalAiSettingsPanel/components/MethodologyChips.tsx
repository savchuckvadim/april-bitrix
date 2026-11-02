'use client';

import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { useMethodologyOptions } from '../../../lib/hooks/use-methodology-options';
import { AI_METHODOLOGY_META, type MethodologyOption } from '../../../model';

interface MethodologyChipsProps {
    /** Домен портала: свои методики портала показываются поверх общих. */
    domain: string | undefined;
    /** Выбранный код; пусто — без методики. */
    value: string;
    onChange: (code: string) => void;
}

const optionHint = (option: MethodologyOption): string =>
    `${option.code} · ${option.version} · пунктов ${option.checkpoints}`;

/**
 * Выбор методики продаж бейджами: «Без методики» и доступные порталу
 * методики (встроенные общего слоя и из таблицы). Незнакомый код из БД
 * показывается отдельным бейджем, чтобы не потеряться при сохранении.
 */
export const MethodologyChips = ({ domain, value, onChange }: MethodologyChipsProps) => {
    const options = useMethodologyOptions(domain);
    const known = options.data?.options ?? [];
    const unknownSelected =
        value !== '' && !known.some((option) => option.code === value);

    return (
        <div className="space-y-2">
            <Label>{AI_METHODOLOGY_META.label}</Label>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant={value === '' ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => onChange('')}
                >
                    {AI_METHODOLOGY_META.none}
                </Button>
                {known.map((option) => (
                    <Button
                        key={option.code}
                        type="button"
                        size="sm"
                        variant={value === option.code ? 'default' : 'outline'}
                        className="rounded-full"
                        title={optionHint(option)}
                        onClick={() => onChange(option.code)}
                    >
                        {option.title}
                    </Button>
                ))}
                {unknownSelected && (
                    <Button
                        type="button"
                        size="sm"
                        variant="default"
                        className="rounded-full"
                        title={AI_METHODOLOGY_META.unknownHint}
                        onClick={() => onChange(value)}
                    >
                        {value}
                    </Button>
                )}
            </div>
            {options.isLoading && (
                <p className="text-xs text-muted-foreground">{AI_METHODOLOGY_META.loading}</p>
            )}
            {options.isError && (
                <p className="text-xs text-warning">{AI_METHODOLOGY_META.error}</p>
            )}
            <p className="text-sm text-muted-foreground">{AI_METHODOLOGY_META.description}</p>
            <p className="text-xs text-muted-foreground/80">{AI_METHODOLOGY_META.globalHint}</p>
        </div>
    );
};
