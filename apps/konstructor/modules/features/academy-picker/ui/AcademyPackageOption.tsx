'use client';

import { Check } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

export interface AcademyPackageOptionProps {
    label: string;
    active: boolean;
    hint?: string;
    onSelect: () => void;
}

/** Один пункт списка академии: галочка у выбранного, подсказка справа. */
export const AcademyPackageOption = ({ label, active, hint, onSelect }: AcademyPackageOptionProps) => (
    <button
        type="button"
        onClick={onSelect}
        className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted',
            active && 'bg-muted font-medium',
        )}
    >
        <Check aria-hidden className={cn('size-3.5 shrink-0', active ? 'opacity-100' : 'opacity-0')} />
        <span className="min-w-0 flex-1">{label}</span>
        {hint ? <span className="shrink-0 text-xs text-warning">{hint}</span> : null}
    </button>
);
