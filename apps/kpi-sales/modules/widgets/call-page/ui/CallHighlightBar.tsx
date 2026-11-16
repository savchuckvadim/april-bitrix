'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import { cn } from '@workspace/ui/lib/utils';
import {
    CALL_PAGE_BADGE_TONE,
    formatClock,
    isHighlightReachable,
    type CallPageHighlightDto,
    type CallPageHighlightGroup,
    type CallPageHighlightKind,
    type CallPageSelection,
} from '@/modules/entities/call-page';

interface CallHighlightBarProps {
    groups: CallPageHighlightGroup[];
    selection: CallPageSelection;
    hasAudio: boolean;
    onToggleKind: (kind: CallPageHighlightKind) => void;
    onOpenHighlight: (highlight: CallPageHighlightDto) => void;
    onClear: () => void;
}

const CHIP =
    'rounded-md outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring';

/**
 * Бейджи над расшифровкой: виды мест разбора с количеством. Нажатие на
 * бейдж подсвечивает все его места; под бейджами — список мест выбранного
 * вида, нажатие ведёт к реплике и включает запись с этой секунды.
 */
export const CallHighlightBar = ({
    groups,
    selection,
    hasAudio,
    onToggleKind,
    onOpenHighlight,
    onClear,
}: CallHighlightBarProps) => {
    if (groups.length === 0) return null;
    const active = groups.find(group => group.kind === selection.kind) ?? null;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {groups.map(group => {
                    const on = group.kind === selection.kind;
                    return (
                        <button
                            key={group.kind}
                            type="button"
                            className={cn(
                                CHIP,
                                selection.kind !== null && !on && 'opacity-50',
                            )}
                            aria-pressed={on}
                            onClick={() => onToggleKind(group.kind)}
                        >
                            <ToneBadge
                                tone={CALL_PAGE_BADGE_TONE[group.tone]}
                                variant={on ? 'solid' : 'soft'}
                            >
                                {group.title} · {group.items.length}
                            </ToneBadge>
                        </button>
                    );
                })}
                {selection.kind !== null && (
                    <button
                        type="button"
                        className="text-xs text-muted-foreground hover:underline"
                        onClick={onClear}
                    >
                        Снять выделение
                    </button>
                )}
            </div>

            {active && (
                <ul className="space-y-1">
                    {active.items.map(item => {
                        const reachable = isHighlightReachable(item, hasAudio);
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    disabled={!reachable}
                                    title={
                                        reachable
                                            ? undefined
                                            : 'Это место не нашлось в расшифровке'
                                    }
                                    className={cn(
                                        'flex w-full items-baseline gap-2 rounded-md px-2 py-1 text-left text-sm',
                                        reachable && 'hover:bg-muted',
                                        item.id === selection.highlightId &&
                                            'bg-muted',
                                        !reachable && 'cursor-default opacity-60',
                                    )}
                                    onClick={() => onOpenHighlight(item)}
                                >
                                    <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                                        {formatClock(item.startSec)}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="font-medium">
                                            {item.label}
                                        </span>
                                        {item.note && (
                                            <span className="text-muted-foreground">
                                                {' — '}
                                                {item.note}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
