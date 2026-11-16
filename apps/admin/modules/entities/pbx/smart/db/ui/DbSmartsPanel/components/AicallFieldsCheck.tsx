'use client';

import { Loader2, SearchCheck } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { getApiErrorMessage } from '../../../../../lib/api-error';
import {
    toAicallCheckView,
    type AicallCheckView,
} from '../../../lib/aicall-check-view';
import { useCheckAicall } from '../../../lib/hooks';

/** Заголовок и строки одного списка; пустой список не показывается. */
function CheckList({
    title,
    lines,
    tone,
}: {
    title: string;
    lines: string[];
    tone?: 'destructive';
}) {
    if (lines.length === 0) return null;
    return (
        <div className={tone === 'destructive' ? 'text-destructive' : undefined}>
            <p>
                {title}: {lines.length}
            </p>
            <ul className="list-disc space-y-0.5 pl-5 text-xs">
                {lines.map((line) => (
                    <li key={line} className="break-words">
                        {line}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function CheckResult({ view }: { view: AicallCheckView }) {
    return (
        <div className="space-y-2 rounded-md border p-3 text-sm">
            {view.summary.map((line) => (
                <p key={line}>{line}</p>
            ))}
            <CheckList
                title="Не хватает полей сводки методики"
                lines={view.missingMethodology}
                tone="destructive"
            />
            <CheckList
                title="Не хватает других полей"
                lines={view.missingOther}
                tone="destructive"
            />
            <CheckList
                title="Списки с недостающими значениями"
                lines={view.enumGaps}
                tone="destructive"
            />
            <CheckList
                title="Лишние поля смарта (разбор их не заполняет)"
                lines={view.extra}
            />
            <p className="text-muted-foreground">{view.advice}</p>
        </div>
    );
}

/**
 * Проверка полей смарта «AI-анализ звонков» до установки: что должно быть и
 * что есть на портале. Только читает портал — ничего не создаёт, поэтому
 * безопасна и там, где установка упирается в лимит полей.
 */
export function AicallFieldsCheck({
    domain,
    disabled,
}: {
    domain: string;
    disabled?: boolean;
}) {
    const check = useCheckAicall();

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                size="sm"
                disabled={disabled || check.isPending || !domain}
                onClick={() => check.mutate(domain)}
            >
                {check.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <SearchCheck className="h-4 w-4" />
                )}
                Проверить поля без установки
            </Button>
            {check.isError && (
                <p className="text-sm text-destructive">
                    {getApiErrorMessage(check.error, 'Проверка не удалась')}
                </p>
            )}
            {check.data && (
                <CheckResult view={toAicallCheckView(check.data)} />
            )}
        </div>
    );
}
