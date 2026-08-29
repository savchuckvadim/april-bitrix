'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireSyncItem } from '../../../lib/field-sync-view';
import { QuestionnaireSyncLine } from './QuestionnaireSyncLine';

interface QuestionnaireSyncItemRowProps {
    item: QuestionnaireSyncItem;
    /** Почему подтянуть нельзя; `null` — можно. */
    blockReason: string | null;
    isApplying: boolean;
    onApply: (item: QuestionnaireSyncItem) => void;
    onTogglePick: (pickKey: string, isPicked: boolean) => void;
}

/**
 * Расхождения одного вопроса и кнопка «подтянуть» рядом с ними.
 *
 * Кнопка у каждого вопроса своя: владелец обычно соглашается не со всем
 * разом — новый вариант списка нужен, а переименование поля в анкете он
 * оставит своим. Уедет ровно то, что отмечено у строк этого вопроса:
 * пока не отмечено ничего, кнопка заперта. Общая кнопка есть отдельно,
 * наверху панели.
 */
export const QuestionnaireSyncItemRow = ({
    item,
    blockReason,
    isApplying,
    onApply,
    onTogglePick,
}: QuestionnaireSyncItemRowProps) => (
    <li
        className={cn(
            'space-y-2 rounded-lg border p-3',
            item.isProblem && 'border-destructive/40 bg-destructive/5',
        )}
    >
        <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                        {item.itemTitle}
                    </span>
                    {/* Сломанная привязка тут же: подтягивать подписи у
                        вопроса, который во фрейм не уедет, бессмысленно. */}
                    {item.statusLabel && (
                        <Badge variant="destructive">{item.statusLabel}</Badge>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs text-muted-foreground">
                        {item.itemCode}
                    </code>
                    {item.fieldName && (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                            {item.fieldName}
                        </code>
                    )}
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                disabled={!item.payload || !!blockReason || isApplying}
                title={blockReason ?? undefined}
                onClick={() => onApply(item)}
            >
                {isApplying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                {isApplying
                    ? QUESTIONNAIRE_EDITOR_TEXT.syncApplying
                    : QUESTIONNAIRE_EDITOR_TEXT.syncApplyItem}
            </Button>
        </div>

        <ul className="space-y-1">
            {item.lines.map(line => (
                <QuestionnaireSyncLine
                    key={line.key}
                    line={line}
                    isDisabled={!!blockReason || isApplying}
                    onTogglePick={onTogglePick}
                />
            ))}
        </ul>
    </li>
);
