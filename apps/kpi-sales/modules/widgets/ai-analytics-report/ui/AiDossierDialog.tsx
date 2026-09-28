'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { GlassDialog, MicroField, MicroSelect } from '@workspace/april-ui';
import {
    AI_DOSSIER_MONTH_OPTIONS,
    AI_DOSSIER_MONTHS,
    aiDossierFilledCount,
    formatAiMoment,
    formatAiMonthRange,
} from '@/modules/entities/ai-analytics';
import { useAiDossier } from '../hooks/use-ai-dossier';
import { useAiManagerName } from '../hooks/use-ai-manager-name';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiQueuedState } from './components/AiQueuedState';
import { AiDossierPassport } from './components/AiDossierPassport';
import { AiDossierSeries } from './components/AiDossierSeries';
import { AiDossierTrends } from './components/AiDossierTrends';
import { AiDossierYoy } from './components/AiDossierYoy';
import { AiDossierSummary } from './components/AiDossierSummary';
import { AiPlanFactTable } from './components/AiPlanFactTable';

export interface AiDossierDialogProps {
    managerId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SECTION_TITLE =
    'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

const MONTH_OPTIONS = AI_DOSSIER_MONTH_OPTIONS.map(months => ({
    value: String(months),
    label: `${months} мес.`,
}));

/** Раздел досье с заголовком; пустой раздел (null) не рисуется — причина в своде. */
const Section = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <section className="space-y-2">
        <h4 className={SECTION_TITLE}>{title}</h4>
        {children}
    </section>
);

/**
 * Досье менеджера: паспорт, ряды недель и месяцев, тренды, план-факт,
 * «год назад», своды обратной связи и меток, готовность и причины пустых
 * разделов. Очередь + WS: пока собирается — скелетон с состоянием
 * задания; «Пересобрать» — заново, свежими данными. Окно — 3/6/12
 * месяцев, считая текущий.
 */
export const AiDossierDialog = ({
    managerId,
    open,
    onOpenChange,
}: AiDossierDialogProps) => {
    const [months, setMonths] = useState<number>(AI_DOSSIER_MONTHS.default);
    const dossier = useAiDossier(managerId, months, open);
    const managerName = useAiManagerName();
    const data = dossier.data;
    const loading = dossier.status === 'loading';

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle>Досье: {managerName(managerId)}</DialogTitle>
                    <AiHowWeCountButton endpoint="dossier" />
                    <AiTheoryLink topic="dossier" variant="icon" />
                </div>
                <DialogDescription>
                    Всё, что витрина знает о менеджере за окно: разделы
                    собираются из ночного пересчёта, пустой раздел приходит с
                    причиной.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap items-center gap-3">
                <MicroField label="Окно">
                    <MicroSelect
                        ariaLabel="Окно досье"
                        value={String(months)}
                        options={MONTH_OPTIONS}
                        className="w-28"
                        onChange={value => setMonths(Number(value))}
                    />
                </MicroField>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    disabled={loading}
                    onClick={dossier.rebuild}
                >
                    <RefreshCw
                        className={loading ? 'h-3 w-3 animate-spin' : 'h-3 w-3'}
                    />
                    Пересобрать
                </Button>
                {data && (
                    <span className="text-xs text-muted-foreground">
                        разделов собрано {aiDossierFilledCount(data)} из 10 ·
                        окно {formatAiMonthRange(data.meta.months)} · собрано{' '}
                        {formatAiMoment(data.meta.generatedAt)}
                    </span>
                )}
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                <AiQueuedState
                    status={dossier.status}
                    jobStatus={dossier.jobStatus}
                    error={dossier.error}
                    loadingText="Собираем досье…"
                    skeletonRows={4}
                    onRetry={dossier.retry}
                />
                {data && (
                    <>
                        {data.passport && (
                            <Section title="Паспорт">
                                <AiDossierPassport passport={data.passport} />
                            </Section>
                        )}
                        {data.trends && (
                            <Section title="Тренды">
                                <AiDossierTrends trends={data.trends} />
                            </Section>
                        )}
                        {data.planFact && (
                            <Section title="План — факт последнего месяца">
                                <AiPlanFactTable
                                    flat
                                    groups={data.planFact.rows.map(row => ({
                                        key: row.managerId,
                                        title: managerName(row.managerId),
                                        rows: row.rows,
                                    }))}
                                />
                            </Section>
                        )}
                        {data.yoy && (
                            <Section title="Год назад">
                                <AiDossierYoy yoy={data.yoy} />
                            </Section>
                        )}
                        {data.series && (
                            <Section title="Ряды окна">
                                <AiDossierSeries series={data.series} />
                            </Section>
                        )}
                        <AiDossierSummary dossier={data} />
                    </>
                )}
            </div>
        </GlassDialog>
    );
};
