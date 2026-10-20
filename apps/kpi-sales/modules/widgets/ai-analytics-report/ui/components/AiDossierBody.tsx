'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { MicroField, MicroSelect } from '@workspace/april-ui';
import {
    AI_DOSSIER_MONTH_OPTIONS,
    aiDossierFilledCount,
    formatAiMoment,
    formatAiMonthRange,
    type AiDossier,
} from '@/modules/entities/ai-analytics';
import { AiDossierPassport } from './AiDossierPassport';
import { AiDossierSeries } from './AiDossierSeries';
import { AiDossierTrends } from './AiDossierTrends';
import { AiDossierYoy } from './AiDossierYoy';
import { AiDossierSummary } from './AiDossierSummary';
import { AiPlanFactTable } from './AiPlanFactTable';

const SECTION_TITLE =
    'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

const MONTH_OPTIONS = AI_DOSSIER_MONTH_OPTIONS.map(months => ({
    value: String(months),
    label: `${months} мес.`,
}));

/** Раздел досье с заголовком; пустой раздел (null) не рисуется — причина в своде. */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-2">
        <h4 className={SECTION_TITLE}>{title}</h4>
        {children}
    </section>
);

interface AiDossierToolbarProps {
    months: number;
    onMonths: (months: number) => void;
    loading: boolean;
    onRebuild: () => void;
    data: AiDossier | null;
}

/** Окно досье (3/6/12 мес.), «Пересобрать», сколько разделов собрано и когда. */
export const AiDossierToolbar = ({ months, onMonths, loading, onRebuild, data }: AiDossierToolbarProps) => (
    <div className="flex flex-wrap items-center gap-3">
        <MicroField label="Окно">
            <MicroSelect
                ariaLabel="Окно досье"
                value={String(months)}
                options={MONTH_OPTIONS}
                className="w-28"
                onChange={value => onMonths(Number(value))}
            />
        </MicroField>
        <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            disabled={loading}
            onClick={onRebuild}
        >
            <RefreshCw className={loading ? 'h-3 w-3 animate-spin' : 'h-3 w-3'} />
            Пересобрать
        </Button>
        {data && (
            <span className="text-xs text-muted-foreground">
                разделов собрано {aiDossierFilledCount(data)} из 10 · окно{' '}
                {formatAiMonthRange(data.meta.months)} · собрано{' '}
                {formatAiMoment(data.meta.generatedAt)}
            </span>
        )}
    </div>
);

interface AiDossierBodyProps {
    dossier: AiDossier;
    managerName: (managerId: string) => string;
}

/**
 * Разделы досье менеджера — общие для диалога и страницы сотрудника:
 * паспорт, тренды, план-факт последнего месяца, «год назад», ряды окна,
 * своды обратной связи и меток, причины пустых разделов.
 */
export const AiDossierBody = ({ dossier, managerName }: AiDossierBodyProps) => (
    <div className="space-y-5">
        {dossier.passport && (
            <Section title="Паспорт">
                <AiDossierPassport passport={dossier.passport} />
            </Section>
        )}
        {dossier.trends && (
            <Section title="Тренды">
                <AiDossierTrends trends={dossier.trends} />
            </Section>
        )}
        {dossier.planFact && (
            <Section title="План — факт последнего месяца">
                <AiPlanFactTable
                    flat
                    groups={dossier.planFact.rows.map(row => ({
                        key: row.managerId,
                        title: managerName(row.managerId),
                        rows: row.rows,
                    }))}
                />
            </Section>
        )}
        {dossier.yoy && (
            <Section title="Год назад">
                <AiDossierYoy yoy={dossier.yoy} />
            </Section>
        )}
        {dossier.series && (
            <Section title="Ряды окна">
                <AiDossierSeries series={dossier.series} />
            </Section>
        )}
        <AiDossierSummary dossier={dossier} />
    </div>
);
