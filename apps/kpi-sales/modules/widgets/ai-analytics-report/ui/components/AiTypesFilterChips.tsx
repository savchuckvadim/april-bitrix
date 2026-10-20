'use client';

import { ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { AiTypeChip } from '../../lib/ai-types-matrix-view.util';

interface AiTypesFilterChipsProps {
    chips: AiTypeChip[];
    hiddenCount: number;
    onToggle: (code: string) => void;
    onShowAll: () => void;
    /** Сноска к помеченным типам (вне средней оценки); null — не показывать. */
    footnote?: string | null;
}

/** Знак сноски у типа, который считается отдельно (вне средней оценки). */
const AI_HINT_MARK = '*';

/**
 * Чипы-фильтр типов звонков блока «AI: типы звонков»: клик прячет тип
 * из таблицы, CSV и рейтингов (и возвращает обратно); скрытые —
 * приглушённые; при скрытых — счётчик и «Показать все». Тип вне средней
 * оценки (приглашение на мероприятие) помечен звёздочкой со сноской.
 */
export const AiTypesFilterChips = ({
    chips,
    hiddenCount,
    onToggle,
    onShowAll,
    footnote = null,
}: AiTypesFilterChipsProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Типы:</span>
        {chips.map(chip => (
            <button
                key={chip.code}
                type="button"
                aria-pressed={!chip.hidden}
                title={[chip.hint, chip.hidden ? 'Показать тип' : 'Скрыть тип']
                    .filter(Boolean)
                    .join('. ')}
                onClick={() => onToggle(chip.code)}
                className={cn(
                    'cursor-pointer rounded-md transition-opacity',
                    chip.hidden && 'opacity-40 hover:opacity-70',
                )}
            >
                <ToneBadge
                    tone={chip.tone}
                    variant={chip.hidden ? 'outline' : 'soft'}
                    size="sm"
                >
                    {chip.label}
                    {chip.hint && <span aria-hidden>{AI_HINT_MARK}</span>}
                </ToneBadge>
            </button>
        ))}
        {footnote && (
            <span className="text-xs text-muted-foreground">
                {AI_HINT_MARK} {footnote}
            </span>
        )}
        {hiddenCount > 0 && (
            <>
                <span className="text-xs text-muted-foreground">
                    Скрыто: {hiddenCount}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={onShowAll}
                >
                    Показать все
                </Button>
            </>
        )}
    </div>
);
