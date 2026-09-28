'use client';

import { Info, RefreshCw } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { formatAiPlanFactPeriod } from '@/modules/entities/ai-analytics';
import { useAiPlanFact } from '../hooks/use-ai-plan-fact';
import type { AiPlanFactView } from '../lib/ai-plan-fact-view.util';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiSectionState } from './components/AiSectionState';
import { AiPlanFactTable } from './components/AiPlanFactTable';

const MUTED = 'text-xs text-muted-foreground';

/** Причины бэка списком (текст бэка, иначе подпись кода). */
const ReasonList = ({ lines }: { lines: readonly string[] }) =>
    lines.length ? (
        <ul className={cn('list-disc space-y-0.5 pl-5', MUTED)}>
            {lines.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
            ))}
        </ul>
    ) : null;

/** Режим «только факт»: что не так и что сделать; причины бэка — мелко ниже. */
const FactOnlyNote = ({
    note,
    reasonLines,
}: {
    note: string;
    reasonLines: readonly string[];
}) => (
    <div className="space-y-2 rounded-md border border-dashed border-border/60 p-3">
        <p className="flex gap-2 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{note}</span>
        </p>
        <ReasonList lines={reasonLines} />
    </div>
);

/** Подсказки над таблицей и сама таблица по готовому виду карточки. */
const PlanFactBody = ({ view }: { view: AiPlanFactView }) => (
    <div className="space-y-3">
        {view.note ? (
            <FactOnlyNote note={view.note} reasonLines={view.reasonLines} />
        ) : (
            <ReasonList lines={view.reasonLines} />
        )}
        {view.coverageText && <p className={MUTED}>{view.coverageText}</p>}
        {view.empty ? (
            <p className={cn('py-2', MUTED)}>
                В периметре нет менеджеров с целями или фактом за месяц.
            </p>
        ) : (
            <AiPlanFactTable
                groups={view.groups}
                factOnly={view.mode === 'fact-only'}
            />
        )}
    </div>
);

/**
 * «План — факт» месяца (Фаза 3): цели из снимка планов на 1-е число против
 * факта на дату — темп по рабочим дням, прогноз, разрыв и «в день надо».
 * Месяц — конец периода фильтра, менеджеры — выбранные в фильтре.
 * Целей нет совсем — компактно «Показатель | Факт» и подсказка, как их
 * задать; цели не у всех — строка покрытия и «плана нет» у строк без цели.
 */
export const AiPlanFactCard = () => {
    const planFact = useAiPlanFact();
    const loading = planFact.status === 'loading';

    return (
        <SectionCard
            surface="glass"
            title="План — факт месяца"
            description={
                planFact.data
                    ? formatAiPlanFactPeriod(planFact.data)
                    : 'Цели месяца против факта: идём ли в график, чем закончим месяц и сколько надо в день'
            }
            actions={
                <>
                    <AiTheoryLink topic="planFact" variant="icon" />
                    <AiHowWeCountButton endpoint="plan-fact" />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={loading || !planFact.hasScope}
                        onClick={planFact.refresh}
                    >
                        <RefreshCw
                            className={cn('h-3 w-3', loading && 'animate-spin')}
                        />
                        Обновить
                    </Button>
                </>
            }
        >
            {!planFact.hasScope ? (
                <p className={cn('py-2', MUTED)}>
                    Период отчёта не задан — не знаем, за какой месяц сверять.
                </p>
            ) : (
                <>
                    <AiSectionState
                        status={planFact.status}
                        error={planFact.error}
                        loadingText="Сверяем план с фактом…"
                        onRetry={planFact.retry}
                    />
                    {planFact.view && <PlanFactBody view={planFact.view} />}
                </>
            )}
        </SectionCard>
    );
};
