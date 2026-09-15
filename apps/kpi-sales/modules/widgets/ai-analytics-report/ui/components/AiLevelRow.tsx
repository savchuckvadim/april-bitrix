'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Input } from '@workspace/ui/components/input';
import { MicroSelect, ToneBadge } from '@workspace/april-ui';
import {
    AI_LEVEL_OPTIONS,
    formatAiTenure,
    isAiManagerLevel,
    type AiLevelFormRow,
    type AiManagerLevel,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';

interface AiLevelRowProps {
    row: AiLevelFormRow;
    error: string | null;
    disabled: boolean;
    onLevel: (level: AiManagerLevel) => void;
    onSince: (since: string) => void;
}

/** Строка формы уровней: менеджер, стаж, селект уровня, дата начала стажа. */
export const AiLevelRow = ({
    row,
    error,
    disabled,
    onLevel,
    onSince,
}: AiLevelRowProps) => {
    const managerName = useAiManagerName();
    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">
                    {managerName(String(row.managerId))}
                </div>
                <div className="text-[0.6875rem] text-muted-foreground">
                    {formatAiTenure(row.tenureMonths)}
                    {row.manual && (
                        <ToneBadge
                            tone="muted"
                            variant="soft"
                            size="sm"
                            className="ml-2"
                        >
                            назначен
                        </ToneBadge>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <MicroSelect
                    ariaLabel="Уровень"
                    value={row.level}
                    options={AI_LEVEL_OPTIONS}
                    disabled={disabled}
                    onChange={value =>
                        isAiManagerLevel(value) && onLevel(value)
                    }
                />
            </TableCell>
            <TableCell>
                <Input
                    type="date"
                    value={row.since}
                    disabled={disabled}
                    aria-invalid={!!error}
                    className="h-7 max-w-40 text-xs"
                    onChange={event => onSince(event.target.value)}
                />
                {error && (
                    <p className="mt-1 text-[0.6875rem] text-destructive">
                        {error}
                    </p>
                )}
            </TableCell>
        </TableRow>
    );
};
