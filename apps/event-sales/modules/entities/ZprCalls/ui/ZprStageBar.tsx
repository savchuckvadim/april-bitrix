'use client';

import { FC, ReactNode } from 'react';
import { GradientScale } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { ZprStageDict } from '../model';
import { findZprLadderIndex } from '../lib/zpr-stage-view';
import { getZprStageBadge } from '../lib/zpr-badge-view';

interface ZprStageBarProps {
    /** STATUS_ID элемента (`DT{entityTypeId}_{categoryId}:{CODE}`). */
    stageId: string;
    /** Словарь стадий воронки; пока не приехал — не рисуем ничего. */
    dict?: ZprStageDict;
    /** Название элемента: в тултипе, а при withLabel — и в строке подписи. */
    title?: string;
    /** Доп. содержимое тултипа: лента комментариев, даты. */
    note?: ReactNode;
    /** Подписать стадию текстом (в узкой колонке полоска без имени немая). */
    withLabel?: boolean;
    className?: string;
}

/**
 * Полоска стадии ЗПР — зеркальный близнец DealStageBar/LeadStageBar:
 * лестница стадий воронки смарта (без провалов), градиент живых цветов
 * пройденных стадий, закрашено до текущей; шкала, тултип и поведение —
 * общий GradientScale.
 *
 * Стадия вне лестницы (провалы «Не состоялся»/«Отменён») рисуется
 * семантическим бейджем — как лид на финале: немая дыра хуже бейджа.
 */
export const ZprStageBar: FC<ZprStageBarProps> = ({
    stageId,
    dict,
    title,
    note,
    withLabel,
    className,
}) => {
    const index = findZprLadderIndex(dict, stageId);
    const ladder = dict?.ladder ?? [];
    const current = index >= 0 ? ladder[index] : undefined;

    if (!current) {
        const badge = getZprStageBadge(dict, stageId);
        if (!badge) return null;
        return (
            <span
                title={title ? `${title}: ${badge.label}` : badge.label}
                className={cn(
                    'inline-flex min-w-0 max-w-full items-center gap-1 rounded-full px-1.5 py-px text-[0.625rem]',
                    badge.className,
                    className,
                )}
            >
                {/* truncate на самой пилюле не работает (text-overflow не
                    применяется к flex-контейнеру) — название лежит отдельным
                    span с потолком, как у LeadStageBar; статус не жмётся. */}
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
                <span className="shrink-0 whitespace-nowrap">
                    {badge.label}
                </span>
            </span>
        );
    }

    /*
     * Градиент живых цветов: от первой стадии к текущей (как у сделок).
     * Стадия без цвета в настройках не роняет рампу — недостающий цвет
     * добираем соседним (правило LeadStageBar).
     */
    const passed = ladder.slice(0, index + 1);
    const ramp = passed.reduce<string[]>((acc, item) => {
        const color = item.color ?? acc[acc.length - 1];
        if (color) acc.push(color);
        return acc;
    }, []);
    const hasRamp = ramp.length === passed.length && ramp.length > 0;

    const currentName = current.name;
    const position =
        ladder.length > 1 ? `${index + 1} / ${ladder.length}` : null;

    const bar = (
        <GradientScale
            labels={ladder.map(item => item.name)}
            currentIndex={index}
            total={ladder.length}
            ramp={hasRamp ? ramp : undefined}
            rampScope={hasRamp ? 'fill' : 'track'}
            shimmer
            title={title}
            note={note}
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
                {/* Как в DealStageBar: название сжимается первым (shrink-[2]),
                    потолок ширины и title — простыни вроде «Лид ОАО „ЗАВОД
                    РЕЗИНОТЕХНИЧЕСКИХ ИЗДЕЛИЙ“» не съедают строку; truncate —
                    во ВЛОЖЕННОМ span, на flex-контейнере он не работает. */}
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
