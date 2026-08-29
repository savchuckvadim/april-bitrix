'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { ArrowRight } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { QUESTIONNAIRE_EDITOR_TEXT } from '../../../consts/questionnaires.const';
import type { QuestionnaireSyncLine as SyncLine } from '../../../lib/field-sync-view';

interface QuestionnaireSyncLineProps {
    line: SyncLine;
    /** Применение заперто целиком — отмечать нечего. */
    isDisabled: boolean;
    onTogglePick: (pickKey: string, isPicked: boolean) => void;
}

/**
 * Одно расхождение: как сейчас в анкете и как стало в Битриксе.
 *
 * Обе стороны показываются рядом намеренно: подпись в анкете — авторская,
 * и владелец решает, менять ли её, только увидев обе формулировки. Пустая
 * сторона (прочерк) означает «этого там нет»: слева — вариант, которого у
 * нас ещё не было, справа — вариант, которого в Битриксе больше нет.
 *
 * Отметка у каждой строки своя: подтянуть новый вариант списка, не отдав
 * при этом формулировку вопроса, иначе было бы нельзя. У строки, которую
 * применять нечего (исчезнувший вариант сверка гасит сама), отметки нет —
 * на её месте пусто, чтобы колонки не разъезжались.
 */
export const QuestionnaireSyncLine = ({
    line,
    isDisabled,
    onTogglePick,
}: QuestionnaireSyncLineProps) => (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {line.canApply ? (
            <Checkbox
                checked={line.isPicked}
                disabled={isDisabled}
                aria-label={QUESTIONNAIRE_EDITOR_TEXT.syncPickLine}
                title={QUESTIONNAIRE_EDITOR_TEXT.syncPickLine}
                onCheckedChange={value =>
                    onTogglePick(line.pickKey, value === true)
                }
            />
        ) : (
            <span aria-hidden className="size-4 shrink-0" />
        )}

        <Badge variant="outline" className="shrink-0">
            {line.label}
        </Badge>

        <span className="text-xs text-muted-foreground">
            {QUESTIONNAIRE_EDITOR_TEXT.syncOur}:
        </span>
        <span className={cn(line.our === null && 'text-muted-foreground')}>
            {line.our ?? QUESTIONNAIRE_EDITOR_TEXT.syncNothing}
        </span>

        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

        <span className="text-xs text-muted-foreground">
            {QUESTIONNAIRE_EDITOR_TEXT.syncLive}:
        </span>
        <span
            className={cn(
                line.live === null ? 'text-muted-foreground' : 'font-medium',
            )}
        >
            {line.live ?? QUESTIONNAIRE_EDITOR_TEXT.syncNothing}
        </span>

        {/* Почему кнопка эту строку не подтянет — рядом с ней самой. */}
        {line.note && (
            <p className="basis-full text-xs text-muted-foreground">
                {line.note}
            </p>
        )}
    </li>
);
