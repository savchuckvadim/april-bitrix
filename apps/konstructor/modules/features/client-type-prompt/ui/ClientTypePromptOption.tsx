'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export interface ClientTypePromptOptionProps {
    label: string;
    /** Идёт запись именно этого варианта. */
    pending: boolean;
    disabled: boolean;
    onSelect: () => void;
}

/** Один вариант типа клиента: кнопка на всю ширину окна. */
export const ClientTypePromptOption = ({
    label,
    pending,
    disabled,
    onSelect,
}: ClientTypePromptOptionProps) => (
    <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-start px-4 text-base"
        disabled={disabled}
        onClick={onSelect}
    >
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {label}
    </Button>
);
