'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import type { ListRow } from '../../../model';

/**
 * Код списка: эталонный IBLOCK_CODE из шаблона против фактического CODE
 * инфоблока в Bitrix и code, записанного в БД `bitrixlists`. Расхождения
 * подсвечены — матчинг идёт по кандидатам (`код`, `группа_тип`, `тип`),
 * поэтому отличие легально, но его важно видеть.
 */
export function ListCodeCell({ row }: { row: ListRow }) {
    const bitrixMatches =
        row.bitrixCode !== null &&
        row.bitrixCode.toLowerCase() === row.code.toLowerCase();
    const dbMatches =
        row.dbCode !== null &&
        row.dbCode.toLowerCase() === row.code.toLowerCase();

    return (
        <div className="font-mono text-xs">
            <div>{row.code}</div>
            {row.inBitrix && !bitrixMatches && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help text-amber-600">
                            в Bitrix: {row.bitrixCode || '—'}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Фактический CODE инфоблока в Bitrix отличается от кода
                        шаблона. Инфоблок сматчен по одному из кандидатов
                        (`{row.code}`, `{row.group}_{row.type}`, `{row.type}`)
                        или по bitrixId из БД — дубликат не создаётся, но CODE
                        остаётся как есть.
                    </TooltipContent>
                </Tooltip>
            )}
            {row.inDb && !dbMatches && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help text-amber-600">
                            в БД: {row.dbCode || '—'}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Код, записанный в `bitrixlists.code`, отличается от кода
                        шаблона (обычно там `группа_тип`).
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}
