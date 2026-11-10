'use client';

import { AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import type { DealSendWarning } from '../lib/deal-send-warnings.util';

export interface DealSendWarningsProps {
    warnings: DealSendWarning[];
}

/** «Не записано: N» — по клику список: поле, что не так, где поправить. */
export const DealSendWarnings = ({ warnings }: DealSendWarningsProps) => {
    if (!warnings.length) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1 text-xs text-warning underline decoration-dotted underline-offset-2"
                >
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                    не записано в сделку: {warnings.length}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 max-w-[90vw] space-y-3 p-3 text-xs">
                {warnings.map(warning => (
                    <div key={`${warning.field}-${warning.problem}`} className="space-y-0.5">
                        <div className="font-semibold text-foreground">
                            {warning.field}: {warning.problem}
                        </div>
                        <div className="text-muted-foreground">{warning.fix}</div>
                    </div>
                ))}
            </PopoverContent>
        </Popover>
    );
};
