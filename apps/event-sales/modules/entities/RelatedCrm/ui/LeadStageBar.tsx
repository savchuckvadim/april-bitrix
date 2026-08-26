'use client';

import { FC } from 'react';
import { GradientScale } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    findLeadStageIndex,
    useLeadStageDict,
} from '../lib/hooks/use-lead-stage-dict';
import { getLeadStatusView } from '../lib/lead-status-view';

interface LeadStageBarProps {
    /** Плоский STATUS_ID лида (RelatedLead.statusId). */
    statusId?: string | null;
    /** Семантика статуса (P/S/F) — для бэйджа, когда лестницы нет. */
    semantic?: string | null;
    /** Название лида: в тултипе, а при withLabel — и в строке подписи. */
    title?: string;
    /** Доп. строка тултипа: ответственный и т.п. */
    note?: string | null;
    /** Подписать текущую стадию текстом (в карточке дела полоска немая). */
    withLabel?: boolean;
    className?: string;
}

/**
 * Полоска стадии ЗАЯВКИ — зеркальный близнец DealStageBar: лестница стадий
 * лид-воронки портала, градиент живых цветов пройденных стадий, закрашено
 * до текущей.
 *
 * Лид вне лестницы (финал CONVERTED/JUNK, чужая категория, нет слепка портала)
 * раньше не рисовал ВООБЩЕ ничего, и в строке связей оставалась немая дыра.
 * Теперь на его месте — семантический бейдж: «В работе / Успех / Провал»,
 * как в карточке связей.
 */
export const LeadStageBar: FC<LeadStageBarProps> = ({
    statusId,
    semantic,
    title,
    note,
    withLabel,
    className,
}) => {
    const dict = useLeadStageDict();
    const index = findLeadStageIndex(dict, statusId);
    const current = index >= 0 ? dict[index] : undefined;

    if (!current) {
        const view = getLeadStatusView(semantic);
        return (
            <span
                title={title ? `${title}: ${view.label}` : view.label}
                className={cn(
                    'inline-flex min-w-0 max-w-full items-center gap-1 rounded-full px-1.5 py-px text-[0.625rem]',
                    view.className,
                    className,
                )}
            >
                {/* truncate на самой пилюле не работает (text-overflow не
                    применяется к flex-контейнеру) — название лежит отдельным
                    span с потолком, как в подписи лестницы; статус не жмётся. */}
                {withLabel && title && (
                    <>
                        <span className="min-w-0 max-w-56 truncate">
                            {title}
                        </span>
                        <span aria-hidden className="shrink-0 opacity-50">
                            ·
                        </span>
                    </>
                )}
                <span className="shrink-0 whitespace-nowrap">{view.label}</span>
            </span>
        );
    }

    /*
     * Градиент живых цветов: от первой стадии к текущей (как у сделок).
     * Стадия без цвета в слепке не роняет всю рампу в палитру СДЕЛКИ —
     * заявка красилась бы её жёлто-фиолетовым и переставала отличаться;
     * недостающий цвет добираем соседним.
     */
    const passed = dict.slice(0, index + 1);
    const ramp = passed.reduce<string[]>((acc, item) => {
        const color = item.color ?? acc[acc.length - 1];
        if (color) acc.push(color);
        return acc;
    }, []);
    const hasRamp = ramp.length === passed.length && ramp.length > 0;

    const currentName = current.name;
    const position = dict.length > 1 ? `${index + 1} / ${dict.length}` : null;

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
            // С подписью className уходит на обёртку: сюда попадает flex-1
            // консюмера, и внутри flex-col он управлял бы высотой, не шириной.
            className={withLabel ? undefined : className}
        />
    );

    if (!withLabel) return bar;

    return (
        <div className={cn('flex min-w-0 flex-col', className)}>
            <div className="flex min-w-0 items-baseline gap-1.5 text-[0.6875rem] leading-tight text-muted-foreground">
                {/* Как в DealStageBar: название сжимается первым, плюс
                    жёсткий потолок — простыни лидогена («TEEST(888…)»)
                    не съедают строку; полное имя — по наведению. */}
                {title && (
                    <>
                        <span
                            title={title}
                            className="min-w-0 max-w-56 shrink-[2] truncate font-medium text-foreground/75"
                        >
                            {title}
                        </span>
                        <span
                            aria-hidden
                            className="shrink-0 text-muted-foreground/50"
                        >
                            ·
                        </span>
                    </>
                )}
                <span className="min-w-0 truncate">{currentName}</span>
                {position && (
                    <span className="shrink-0 text-muted-foreground/70">
                        {position}
                    </span>
                )}
            </div>
            {bar}
        </div>
    );
};
