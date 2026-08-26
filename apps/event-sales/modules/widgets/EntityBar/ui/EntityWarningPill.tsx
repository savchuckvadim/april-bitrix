'use client';

import { FC } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { TONE_SOFT } from '@workspace/april-ui';
import type {
    EntityWarning,
    EntityWarningActionId,
} from '../lib/hooks/use-entity-warnings';
import { entityWarningTone } from '../lib/entity-warning-view';

export type EntityWarningHandlers = Partial<
    Record<EntityWarningActionId, () => void>
>;

/**
 * Одно предупреждение шапки: иконка + текст + действие («Заполнить»,
 * «Найти по ИНН»). Общая пилюля для статичной строки (EntityWarnings) и
 * всплывашки у названия (EntityWarningsFloat) — разметка одна, различие
 * только в контейнере.
 *
 * Тон — из entityWarningTone (blocking → destructive, иначе warning; хинты
 * о выборе сделки несут явный info/warning). Длинный кусок (accent: название
 * сделки, имя менеджера) — вложенный span с потолком ширины и truncate.
 */
export const EntityWarningPill: FC<{
    warning: EntityWarning;
    handlers?: EntityWarningHandlers;
}> = ({ warning, handlers }) => {
    const handler = warning.action && handlers?.[warning.action.id];
    const tone = entityWarningTone(warning);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs',
                TONE_SOFT[tone],
            )}
        >
            {tone === 'destructive' ? (
                <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
            ) : (
                <Info aria-hidden className="size-3.5 shrink-0" />
            )}
            <span className="min-w-0">
                {warning.text}
                {warning.accent && (
                    <span className="inline-block max-w-44 truncate align-bottom font-medium">
                        {warning.accent.text}
                    </span>
                )}
                {warning.accent?.after}
            </span>
            {warning.action && handler && (
                <button
                    type="button"
                    onClick={handler}
                    className="cursor-pointer font-semibold underline underline-offset-2"
                >
                    {warning.action.label}
                </button>
            )}
        </span>
    );
};
