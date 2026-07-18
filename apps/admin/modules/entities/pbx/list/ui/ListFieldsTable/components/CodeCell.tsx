'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import type { ListFieldRow } from '../../../model';

/**
 * CODE свойства: эталонный (fullCode) против фактических в Bitrix и в PortalDB.
 * Расхождения подсвечиваются — «Синхронизировать» мигрирует CODE на эталонный.
 */
export function CodeCell({ row }: { row: ListFieldRow }) {
    const bitrixMatches =
        row.bitrixCode !== null &&
        row.bitrixCode?.toLowerCase() === row.fullCode?.toLowerCase();
    // В PortalDB (`bitrixfields.code`) хранится короткий code, не полный CODE.
    const dbMatches =
        row.dbCode !== null &&
        row.dbCode?.toLowerCase() === row.code?.toLowerCase();

    return (
        <div className="font-mono text-xs">
            <div>{row.fullCode}</div>
            {row.inBitrix && !bitrixMatches && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help text-amber-600">
                            в Bitrix: {row.bitrixCode || '—'}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Фактический CODE свойства в Bitrix отличается от
                        эталонного. «Синхронизировать» обновит CODE на
                        эталонный.
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
                        code, сохранённый в PortalDB (`bitrixfields.code`),
                        отличается от короткого эталонного code «{row.code}».
                        «Синхронизировать» перепишет зеркало.
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}
