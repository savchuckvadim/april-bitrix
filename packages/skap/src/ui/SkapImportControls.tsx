'use client';

import { FC } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    CircleAlert,
    CloudDownload,
    ExternalLink,
    FolderOpen,
    Loader2,
    Table2,
} from 'lucide-react';
import { useSkapImport } from '../lib/hooks';

/**
 * Портальные контролы СКАП: кнопка «Обновить из хранилища» (джоб импорта +
 * индикатор прогона) и две ссылки — папка «СКАП. Загрузка» на Диске и список
 * элементов смарта «СКАП» в CRM. Ссылки появляются, когда бэк их знает:
 * folderUrl — после первого прогона, smartUrl — после установки смарта.
 *
 * `compact` — режим для тесных шапок (kpi-service, рядом со «Скачать»):
 * только иконки, подписи уходят в title; ошибка запуска — иконкой с title.
 */
export const SkapImportControls: FC<{
    domain: string;
    compact?: boolean;
}> = ({ domain, compact = false }) => {
    const { status, isImporting, runImport, runError } = useSkapImport(domain);

    if (!domain) return null;

    const runTitle =
        'Проверить папку «СКАП. Загрузка» на Диске и обработать новые файлы';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                size="sm"
                variant="outline"
                className={`h-7 cursor-pointer gap-1.5 ${compact ? 'w-7 p-0' : ''}`}
                disabled={isImporting}
                onClick={runImport}
                title={isImporting ? 'Импорт СКАП идёт…' : runTitle}
                aria-label="Обновить СКАП из хранилища"
            >
                {isImporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <CloudDownload className="h-3.5 w-3.5" />
                )}
                {!compact &&
                    (isImporting ? 'Импорт идёт…' : 'Обновить из хранилища')}
            </Button>

            {status && status.pendingFiles > 0 && (
                <span
                    className="text-xs text-muted-foreground"
                    title="Файлов ждёт обработки"
                >
                    {compact
                        ? status.pendingFiles
                        : `файлов в очереди: ${status.pendingFiles}`}
                </span>
            )}

            {status?.folderUrl && (
                <a
                    href={status.folderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
                    title="Хранилище СКАП: папка «СКАП. Загрузка» на Диске портала"
                >
                    <FolderOpen className="h-3.5 w-3.5" />
                    {!compact && (
                        <>
                            Хранилище СКАП
                            <ExternalLink className="h-3 w-3" />
                        </>
                    )}
                </a>
            )}

            {status?.smartUrl && (
                <a
                    href={status.smartUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
                    title="Смарт СКАП: элементы смарт-процесса в CRM портала"
                >
                    <Table2 className="h-3.5 w-3.5" />
                    {!compact && (
                        <>
                            Смарт СКАП
                            <ExternalLink className="h-3 w-3" />
                        </>
                    )}
                </a>
            )}

            {runError &&
                (compact ? (
                    <span title={runError} aria-label={runError}>
                        <CircleAlert className="h-3.5 w-3.5 text-destructive" />
                    </span>
                ) : (
                    <span className="text-xs text-destructive" title={runError}>
                        {runError}
                    </span>
                ))}
        </div>
    );
};
