'use client';

import { useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { formatLogTime, levelTone } from '../../lib/logs-view';
import type { LogRow } from '../../model';

/** Последние строки журнала; нажатие на строку раскрывает meta и стек. */
export const LogsRowsTable = ({ rows, loading }: { rows: LogRow[]; loading: boolean }) => {
    const [open, setOpen] = useState<number | null>(null);
    return (
        <SectionCard
            title="Строки журнала"
            description="Последние записи по фильтру, новые сверху. Нажмите на строку — meta и стек."
        >
            {loading && <p className="text-sm text-muted-foreground">Загружаем…</p>}
            {!loading && rows.length === 0 && (
                <p className="text-sm text-muted-foreground">Записей по фильтру нет.</p>
            )}
            <ul className="divide-y">
                {rows.map((row, index) => (
                    <li key={`${row.at}-${index}`} className="py-2">
                        <button
                            type="button"
                            className="w-full text-left"
                            onClick={() => setOpen(open === index ? null : index)}
                        >
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatLogTime(row.at)}</span>
                                <ToneBadge tone={levelTone(row.level)} size="sm">
                                    {row.level}
                                </ToneBadge>
                                <span>{row.app}</span>
                                {row.context && <span>· {row.context}</span>}
                                {row.domain && <span>· {row.domain}</span>}
                            </div>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm">{row.message}</p>
                        </button>
                        {open === index && (row.meta || row.trace) && (
                            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs">
                                {[row.meta, row.trace].filter(Boolean).join('\n\n')}
                            </pre>
                        )}
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
};
