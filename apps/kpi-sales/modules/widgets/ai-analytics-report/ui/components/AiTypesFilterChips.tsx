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
}

/**
 * Чипы-фильтр типов звонков блока «AI: типы звонков»: клик прячет тип
 * из таблицы, CSV и рейтингов (и возвращает обратно); скрытые —
 * приглушённые; при скрытых — счётчик и «Показать все».
 */
export const AiTypesFilterChips = ({
    chips,
    hiddenCount,
    onToggle,
    onShowAll,
}: AiTypesFilterChipsProps) => (
    <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Типы:</span>
        {chips.map(chip => (
            <button
                key={chip.code}
                type="button"
                aria-pressed={!chip.hidden}
                title={chip.hidden ? 'Показать тип' : 'Скрыть тип'}
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
                </ToneBadge>
            </button>
        ))}
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
