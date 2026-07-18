'use client';

import { TableHead } from '@workspace/ui/components/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';

/** Заголовок столбца с тултипом-пояснением статуса. */
export function HeadWithHint({
    label,
    hint,
    className,
}: {
    label: string;
    hint: string;
    className?: string;
}) {
    return (
        <TableHead className={className}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="cursor-help underline decoration-dotted">
                        {label}
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{hint}</TooltipContent>
            </Tooltip>
        </TableHead>
    );
}
