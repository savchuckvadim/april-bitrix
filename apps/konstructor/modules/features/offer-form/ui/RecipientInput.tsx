'use client';

import { MicroSpinner } from '@workspace/april-ui/feedback';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

export interface RecipientInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    /** Склонённое значение под полем («в дательном падеже») */
    cased?: string;
    casedLoading?: boolean;
    placeholder?: string;
    className?: string;
}

/** Поле получателя: подпись, ввод и падёжная строка под ним. */
export const RecipientInput = ({
    id,
    label,
    value,
    onChange,
    onBlur,
    cased,
    casedLoading,
    placeholder,
    className,
}: RecipientInputProps) => (
    <div className={className}>
        <div className="flex flex-col gap-1">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                value={value}
                placeholder={placeholder}
                onChange={event => onChange(event.target.value)}
                onBlur={onBlur}
            />
        </div>
        {cased !== undefined ? (
            <p className="mt-1 flex min-h-4 items-center gap-1 text-xs text-muted-foreground">
                {casedLoading ? (
                    <>
                        <MicroSpinner size={12} />
                        склоняю…
                    </>
                ) : cased ? (
                    <>в КП: {cased}</>
                ) : null}
            </p>
        ) : null}
    </div>
);
