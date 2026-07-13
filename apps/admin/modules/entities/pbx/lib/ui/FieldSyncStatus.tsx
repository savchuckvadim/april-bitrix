'use client';

import { Badge } from '@workspace/ui/components/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';

/**
 * At-a-glance sync status for a three-source compare row. Fully present in
 * template + Bitrix + PortalDB → green "синхронизировано"; otherwise an amber
 * badge whose tooltip spells out exactly what is missing (the "вопросики").
 */
export function FieldSyncStatus({
    inTemplate,
    inBitrix,
    inDb,
}: {
    inTemplate: boolean;
    inBitrix: boolean;
    inDb: boolean;
}) {
    const missing: string[] = [];
    if (!inTemplate) missing.push('нет в шаблоне');
    if (!inBitrix) missing.push('не установлено в Bitrix');
    if (!inDb) missing.push('нет в БД');

    if (missing.length === 0) {
        return (
            <Badge className="border-transparent bg-emerald-600 text-white hover:bg-emerald-600">
                ✓ синхронизировано
            </Badge>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    variant="outline"
                    className="cursor-help border-amber-500 text-amber-600"
                >
                    ⚠ {missing.length === 1 ? missing[0] : `вопросы (${missing.length})`}
                </Badge>
            </TooltipTrigger>
            <TooltipContent>{missing.join(', ')}</TooltipContent>
        </Tooltip>
    );
}
