'use client';

import { FC } from 'react';
import { GradientScale } from '@workspace/april-ui';
import {
    findLeadStageIndex,
    useLeadStageDict,
} from '../lib/hooks/use-lead-stage-dict';

interface LeadStageBarProps {
    /** Плоский STATUS_ID лида (RelatedLead.statusId). */
    statusId?: string | null;
    /** Название лида в тултипе. */
    title?: string;
    /** Доп. строка тултипа: ответственный и т.п. */
    note?: string | null;
    /** Подписать текущую стадию текстом (в карточке дела полоска немая). */
    withLabel?: boolean;
    className?: string;
}

/**
 * Полоска стадии ЛИДА — зеркальный близнец DealStageBar: лестница стадий
 * лид-воронки портала, градиент живых цветов пройденных стадий, закрашено
 * до текущей. Лид на финале (CONVERTED/JUNK) или без слепка портала полоску
 * не получает — вызывающий оставляет семантический бейдж.
 */
export const LeadStageBar: FC<LeadStageBarProps> = ({
    statusId,
    title,
    note,
    withLabel,
    className,
}) => {
    const dict = useLeadStageDict();
    const index = findLeadStageIndex(dict, statusId);
    const current = index >= 0 ? dict[index] : undefined;
    if (!current) return null;

    // Градиент живых цветов: от первой стадии к текущей (как у сделок).
    const ramp = dict
        .slice(0, index + 1)
        .map(item => item.color)
        .filter((color): color is string => Boolean(color));
    const hasRamp = ramp.length === index + 1;

    const currentName = current.name;
    const position = `${index + 1} / ${dict.length}`;

    const bar = (
        <GradientScale
            labels={dict.map(item => item.name)}
            currentIndex={index}
            total={dict.length}
            ramp={hasRamp ? ramp : undefined}
            rampScope={hasRamp ? 'fill' : 'track'}
            shimmer
            title={title}
            note={note ? <p>{note}</p> : undefined}
            ariaLabel={`${title ? `${title}: ` : ''}${currentName}`}
            className={className}
        />
    );

    if (!withLabel) return bar;

    return (
        <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-baseline gap-2 text-[0.6875rem] leading-tight text-muted-foreground">
                <span className="min-w-0 truncate">{currentName}</span>
                <span className="shrink-0 text-muted-foreground/70">
                    {position}
                </span>
            </div>
            {bar}
        </div>
    );
};
