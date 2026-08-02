'use client';

import type { FC } from 'react';
import { SALES_FLOW } from '../constants/sales-flow';
import type { ProcessModel } from '../types';
import { FlowStepRow } from './FlowStepRow';
import { StageBreakdown } from './StageBreakdown';

interface ProcessFlowProps {
    model: ProcessModel;
}

/**
 * Процесс целиком: до воронки, по стадиям воронки и после неё.
 *
 * Порядок неслучаен. Сначала «Вход» — как клиент вообще попадает в работу.
 * Потом разбор по стадиям: главный ответ на «что где происходит». Потом цикл
 * отчёта, который одинаков на каждой стадии, и исход.
 */
export const ProcessFlow: FC<ProcessFlowProps> = ({ model }) => {
    const exitActors = new Map(
        model.exits
            .filter(exit => exit.actor)
            .map(exit => [exit.id, exit.actor!] as const),
    );

    const phase = (id: string) => SALES_FLOW.find(item => item.id === id);
    const intake = phase('intake');
    const loop = phase('loop');
    const outcome = phase('outcome');

    return (
        <div className="flex flex-col gap-6">
            {intake && (
                <section className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                            1 · {intake.title}
                        </h2>
                        <p className="text-muted-foreground text-xs">
                            {intake.subtitle}
                        </p>
                    </div>

                    <ol className="space-y-1.5">
                        {intake.steps.map(step => (
                            <FlowStepRow
                                key={step.id}
                                step={step}
                                model={model}
                                exitActors={exitActors}
                            />
                        ))}
                    </ol>
                </section>
            )}

            <StageBreakdown model={model} />

            {loop && (
                <section className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                            3 · {loop.title}
                        </h2>
                        <p className="text-muted-foreground text-xs">
                            {loop.subtitle}
                        </p>
                    </div>

                    <ol className="space-y-1.5">
                        {loop.steps.map(step => (
                            <FlowStepRow
                                key={step.id}
                                step={step}
                                model={model}
                                exitActors={exitActors}
                            />
                        ))}
                    </ol>
                </section>
            )}

            {outcome && (
                <section className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                            4 · {outcome.title}
                        </h2>
                        <p className="text-muted-foreground text-xs">
                            {outcome.subtitle}
                        </p>
                    </div>

                    <ol className="space-y-1.5">
                        {outcome.steps.map(step => (
                            <FlowStepRow
                                key={step.id}
                                step={step}
                                model={model}
                                exitActors={exitActors}
                            />
                        ))}
                    </ol>
                </section>
            )}
        </div>
    );
};
