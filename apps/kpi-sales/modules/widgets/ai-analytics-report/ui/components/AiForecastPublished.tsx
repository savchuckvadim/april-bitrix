'use client';

import type { ReactNode } from 'react';
import { HintTooltip } from '@workspace/april-ui';
import { AI_FORECAST_TEXT } from '../../lib/ai-forecast.texts';
import type { AiForecastPublishedView } from '../../lib/ai-forecast.util';
import { AiForecastTodo } from './AiForecastTodo';

const T = AI_FORECAST_TEXT.published;
const DASHED = 'border-b border-dashed border-muted-foreground';

interface AiForecastPublishedProps {
    view: AiForecastPublishedView;
}

/** Подпись с подсказкой (пунктир) — сложное прячем в HintTooltip. */
const Hinted = ({
    label,
    lines,
}: {
    label: string;
    lines: readonly ReactNode[];
}) => (
    <HintTooltip title={label} lines={[...lines]}>
        <span className={DASHED}>{label}</span>
    </HintTooltip>
);

/** Граница или середина вилки: подпись сверху, число крупно. */
const BandValue = ({
    label,
    value,
    main = false,
}: {
    label: ReactNode;
    value: string;
    main?: boolean;
}) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span
            className={
                main
                    ? 'text-2xl font-semibold tabular-nums'
                    : 'text-lg font-medium tabular-nums text-muted-foreground'
            }
        >
            {value}
        </span>
    </div>
);

/**
 * Прогноз «включён»: середина, нижняя и верхняя граница вилки с подписью,
 * как часто факт в неё попадает (уровень из ответа), деньги, сделано с
 * начала месяца, простые прогнозы для сравнения — в подсказке.
 */
export const AiForecastPublished = ({ view }: AiForecastPublishedProps) => (
    <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <BandValue label={T.low} value={view.low} />
            <BandValue
                label={<Hinted label={T.middle} lines={[T.middleHint]} />}
                value={view.middle}
                main
            />
            <BandValue label={T.high} value={view.high} />
        </div>
        <p className="text-xs text-muted-foreground">{view.rangeCaption}</p>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
            <dt>
                <Hinted label={T.money} lines={[T.moneyHint]} />
            </dt>
            <dd className="font-medium text-foreground tabular-nums">
                {view.money
                    ? `${view.money.middle} (${view.money.range})`
                    : T.moneyMissing}
                {view.money?.note && (
                    <span className="block font-normal text-muted-foreground">
                        {view.money.note}
                    </span>
                )}
            </dd>
            <dt>{T.done}</dt>
            <dd className="font-medium text-foreground tabular-nums">
                {view.done ?? T.doneMissing}
            </dd>
            <dt>
                <Hinted
                    label={AI_FORECAST_TEXT.accuracy.label}
                    lines={[
                        T.compareHint,
                        `${T.compare}: ${view.compareLines.join('; ')}.`,
                    ]}
                />
            </dt>
            <dd>{view.accuracy}</dd>
        </dl>
        <AiForecastTodo
            text={view.todo}
            links={[
                { topic: view.theory },
                {
                    topic: 'forecastMoney',
                    label: AI_FORECAST_TEXT.theoryMoney,
                },
            ]}
        />
    </div>
);
