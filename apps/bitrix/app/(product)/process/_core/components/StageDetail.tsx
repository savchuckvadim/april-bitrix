'use client';

import type { FC } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { KPI_BADGE_LABEL, KPI_SOURCE_HINT } from '../lib/kpi-source.util';
import { ACTOR_LABEL } from '../lib/actor.util';
import { OWNER_NOTE, OWNER_TONE_CLASS } from '../lib/owner.util';
import type { ProcessSatellite, StageView, KpiSource } from '../types';

interface StageDetailProps {
    /** Воронки-спутники из модели: часть из них убирают ответы на вопросы. */
    satellites: ProcessSatellite[];
    view: StageView;
    /** Откуда берутся цифры — от этого зависит смысл отметки об учёте. */
    kpiSource: KpiSource;
}

/** Содержимое модалки стадии: кто ведёт, где живёт, что система делает сама. */
export const StageDetail: FC<StageDetailProps> = ({
    satellites,
    view,
    kpiSource,
}) => {
    const { stage, owner, actor } = view;
    const anchored = satellites.filter(
        satellite => satellite.anchorStageId === stage.id,
    );

    return (
        <div className="space-y-5">
            <div
                className={cn(
                    'rounded-xl border px-4 py-3 text-sm font-medium',
                    OWNER_TONE_CLASS[owner],
                )}
            >
                {OWNER_NOTE[owner]}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Ведёт: {ACTOR_LABEL[actor]}</Badge>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {stage.id}
                </Badge>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {stage.bitrixId}
                </Badge>
                {view.writesKpi && (
                    <Badge
                        variant="outline"
                        title={KPI_SOURCE_HINT[kpiSource]}
                        className="border-success/50 text-success gap-1"
                    >
                        <BarChart3 className="h-3 w-3" aria-hidden />
                        {KPI_BADGE_LABEL[kpiSource]}
                    </Badge>
                )}
                {stage.isClosing && (
                    <Badge
                        variant="outline"
                        className="border-success/50 text-success"
                    >
                        закрывает сделку
                    </Badge>
                )}
                {!stage.canBeLead && (
                    <Badge
                        variant="outline"
                        className="border-muted-foreground/40 text-muted-foreground"
                    >
                        лиду недоступна
                    </Badge>
                )}
            </div>

            <section>
                <h3 className="text-primary flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    Что система делает сама
                </h3>
                <ul className="text-foreground/90 mt-2 space-y-2 text-sm leading-relaxed">
                    {stage.systemDoes.map(item => {
                        /**
                         * Строка про запись KPI перестаёт быть правдой, если
                         * ответ в пульте снял отметку с этой стадии. Молча
                         * оставить её нельзя: рядом висит бейдж «не пишется»,
                         * и документ начинает спорить сам с собой.
                         */
                        const isMuted = !view.writesKpi && item.includes('KPI');

                        return (
                            <li key={item} className="flex gap-2.5">
                                <span
                                    className={cn(
                                        'mt-2 size-1.5 shrink-0 rounded-full',
                                        isMuted
                                            ? 'bg-muted-foreground/40'
                                            : 'bg-primary',
                                    )}
                                    aria-hidden
                                />
                                <span
                                    className={
                                        isMuted
                                            ? 'text-muted-foreground/70'
                                            : undefined
                                    }
                                >
                                    {item}
                                    {isMuted && (
                                        <span className="text-warning block text-xs">
                                            По выбранному регламенту этой записи
                                            здесь не будет: отчётность
                                            начинается позже.
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </section>

            {anchored.length > 0 && (
                <section>
                    <h3 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                        Здесь включается параллельная воронка
                    </h3>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        Эти сделки система заводит и двигает сама — по отчёту
                        менеджера в «Звонках». Руками их не создают: менеджер
                        делает свою работу, а сущности появляются следом.
                    </p>
                    <div className="mt-2 space-y-3">
                        {anchored.map(satellite => (
                            <div
                                key={satellite.id}
                                className="bg-muted/40 rounded-xl p-3"
                            >
                                <p className="text-foreground font-semibold">
                                    {satellite.label}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-sm">
                                    {satellite.summary}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {satellite.stages.map(item => (
                                        <span
                                            key={item.id}
                                            className={cn(
                                                'rounded-full border px-2 py-0.5 text-[11px]',
                                                item.isTerminal
                                                    ? 'text-muted-foreground border-dashed'
                                                    : 'border-primary/40 text-foreground/80',
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-muted-foreground mt-2 text-xs">
                                    {satellite.link}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
