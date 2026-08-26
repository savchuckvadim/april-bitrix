'use client';

import { FC } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip } from '@workspace/april-ui';
import type { EntityWarning } from '../lib/hooks/use-entity-warnings';
import { useWarningHint } from '../lib/hooks/use-warning-hint';
import {
    entityWarningFullText,
    entityWarningsMarkerTone,
} from '../lib/entity-warning-view';
import {
    EntityWarningPill,
    type EntityWarningHandlers,
} from './EntityWarningPill';

/** Цвет маркера по самому тревожному тону набора (см. entityWarningsMarkerTone). */
const MARKER_TONE_CLASS = {
    destructive: 'text-destructive',
    warning: 'text-warning',
    info: 'text-info',
} as const;

/**
 * Предупреждения у названия сущности — «всплыло и ушло» (todo2508 №6).
 *
 * Жёлтая строка на всю шапку места больше не занимает: при появлении
 * предупреждений карточка с пилюлями всплывает absolute ПОД названием и сама
 * уходит; остаётся компактный маркер-иконка — важная информация («компания не
 * привязана» объясняет урезанный набор типов звонков) не исчезает
 * безвозвратно: ховер/фокус показывает карточку снова, клик прибивает.
 * Скрытая карточка размонтируется — кликов под шапкой не перехватывает.
 */
export const EntityWarningsFloat: FC<{
    warnings: EntityWarning[];
    handlers?: EntityWarningHandlers;
}> = ({ warnings, handlers }) => {
    const hint = useWarningHint(warnings.map(warning => warning.id));
    if (!warnings.length) return null;

    const hasBlocking = warnings.some(warning => warning.blocking);
    const MarkerIcon = hasBlocking ? AlertTriangle : Info;
    const markerTone = entityWarningsMarkerTone(warnings);

    return (
        <span className="relative inline-flex shrink-0 items-center">
            <HintTooltip
                title={warnings.map(entityWarningFullText).join(' • ')}
            >
                <button
                    type="button"
                    aria-label={`Предупреждения: ${warnings.length}`}
                    aria-expanded={hint.visible}
                    {...hint.markerProps}
                    className={cn(
                        'relative inline-flex size-5 cursor-pointer items-center justify-center rounded-md',
                        MARKER_TONE_CLASS[markerTone],
                        hint.pinned && 'bg-muted',
                    )}
                >
                    <MarkerIcon aria-hidden className="size-4" />
                    {warnings.length > 1 && (
                        <span className="absolute -top-1 -right-1 rounded-full bg-muted px-1 text-[0.55rem] leading-3 font-semibold text-muted-foreground">
                            {warnings.length}
                        </span>
                    )}
                </button>
            </HintTooltip>

            {hint.visible && (
                <div
                    role="status"
                    aria-live="polite"
                    className="absolute top-full left-0 z-30 mt-1.5 flex w-max max-w-96 flex-col gap-1 rounded-md border border-border bg-popover/95 p-1.5 shadow-md backdrop-blur animate-hint-in motion-reduce:animate-none"
                    onMouseEnter={hint.markerProps.onMouseEnter}
                    onMouseLeave={hint.markerProps.onMouseLeave}
                >
                    {warnings.map(warning => (
                        <EntityWarningPill
                            key={warning.id}
                            warning={warning}
                            handlers={handlers}
                        />
                    ))}
                </div>
            )}
        </span>
    );
};
