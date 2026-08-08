'use client';

import { FC } from 'react';
import { GradientScale } from '@workspace/april-ui';
import type { RelatedStage } from '../model';
import { stageProgress } from '../lib/stage-view';
import { useStageDict } from '../lib/hooks/use-stage-dicts';

interface DealStageBarProps {
    stage: RelatedStage;
    /** Название сущности в тултипе (сделка/лид). */
    title?: string;
    /** Доп. строка тултипа: сумма, ответственный. */
    note?: string | null;
    /**
     * Янтарная метка справа: привязана к задаче, но в графе связей клиента
     * её нет (создана без CRM-связей).
     */
    isMismatch?: boolean;
    /** Подписать стадию текстом: в карточке дела полоска без имени немая. */
    withLabel?: boolean;
    className?: string;
}

/**
 * ЕДИНАЯ полоска стадии для всего приложения: карточки дел, связанные сделки
 * клиента, панель дублей. Раньше обёрток было три, и цвета расходились —
 * привязанные к задаче сделки красились живой палитрой воронки портала, а
 * сделки клиента — токенами дизайн-системы.
 *
 * Здесь только доменная часть: словарь стадий → подписи делений, цвета
 * пройденных стадий → рампа. Шкала, тултип и поведение — общий GradientScale.
 */
export const DealStageBar: FC<DealStageBarProps> = ({
    stage,
    title,
    note,
    isMismatch,
    withLabel,
    className,
}) => {
    const dict = useStageDict(stage);

    // Словарь (без стадий-провалов) — источник истины для шкалы. Стадии нет
    // в словаре (например, сделка на отказе) — фолбэк на order/total графа.
    const dictIndex = dict
        ? dict.findIndex(item => item.statusId === stage.bitrixId)
        : -1;
    const hasDict = dictIndex >= 0 && !!dict;

    const progress = stageProgress(stage);
    if (!hasDict && progress === null) return null;

    // Живые цвета пройденных стадий: градиент идёт от первой к текущей и
    // заканчивается её цветом (дошли до «Переговоров» — конец зелёный).
    const portalRamp = hasDict
        ? dict
              .slice(0, dictIndex + 1)
              .map(item => item.color)
              .filter((color): color is string => Boolean(color))
        : [];
    const hasPortalRamp = hasDict && portalRamp.length === dictIndex + 1;

    const currentName =
        stage.title ?? dict?.[dictIndex]?.name ?? stage.bitrixId;
    const position =
        hasDict && dictIndex >= 0
            ? `${dictIndex + 1} / ${dict.length}`
            : stage.order !== undefined && stage.order !== null && stage.total
              ? `${stage.order + 1} / ${stage.total}`
              : '';

    const bar = (
        <GradientScale
            labels={hasDict ? dict.map(item => item.name) : []}
            currentIndex={hasDict ? dictIndex : (stage.order ?? -1)}
            value={hasDict ? undefined : (progress ?? undefined)}
            total={hasDict ? dict.length : (stage.total ?? undefined)}
            ramp={hasPortalRamp ? portalRamp : undefined}
            rampScope={hasPortalRamp ? 'fill' : 'track'}
            shimmer
            title={title}
            note={
                <>
                    {note && <p>{note}</p>}
                    {isMismatch && (
                        <p className="text-primary-foreground/70">
                            {/* Привязана к задаче, но не связана с клиентом */}
                        </p>
                    )}
                </>
            }
            trailing={
                isMismatch ? (
                    <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-warning"
                    />
                ) : undefined
            }
            ariaLabel={`${title ? `${title}: ` : ''}${
                stage.title ?? dict?.[dictIndex]?.name ?? stage.bitrixId
            }`}
            className={className}
        />
    );

    if (!withLabel) return bar;

    return (
        <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-baseline gap-2 text-[0.6875rem] leading-tight text-muted-foreground">
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
