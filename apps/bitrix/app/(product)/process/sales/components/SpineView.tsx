'use client';

import type { FC } from 'react';
import { ListTree } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CallsPlacement } from '../../_core/components/CallsPlacement';
import { ControlPanel } from '../../_core/components/ControlPanel';
import { EntityListsDialog } from '../../_core/components/EntityListsDialog';
import { FillRecommended } from '../../_core/components/FillRecommended';
import { ProcessDialog } from '../../_core/components/ProcessDialog';
import { ProcessEdges } from '../../_core/components/ProcessEdges';
import { ProcessFlow } from '../../_core/components/ProcessFlow';
import { ProcessShell } from '../../_core/components/ProcessShell';
import { SectionNav } from '../../_core/components/SectionNav';
import { QuestionPanel } from '../../_core/components/QuestionPanel';
import { RegulationPanel } from '../../_core/components/RegulationPanel';
import { SatelliteDetail } from '../../_core/components/SatelliteDetail';
import { SatelliteRail } from '../../_core/components/SatelliteRail';
import { SpineCanvas } from '../../_core/components/SpineCanvas';
import { StageDetail } from '../../_core/components/StageDetail';
import { SALES_PRESETS } from '../../_core/constants/presets';
import { SALES_QUESTIONS } from '../../_core/constants/questions';
import '../../_core/process-print.css';
import { SALES_PAGE_META } from '../constants/copy';
import { useScrollToTarget } from '../../_core/hooks/use-scroll-to-target';
import { useSalesProcess } from '../hooks/use-sales-process';

/**
 * Вид «Хребет процесса» — базовый.
 *
 * Сверху пульт, снизу один рельс от первой стадии до продажи с двумя полосами
 * покрытия, идущими навстречу. Всё, что видно на экране, выводится из чистой
 * функции deriveProcessModel — рендерер своего состояния не держит.
 */
export const SpineView: FC = () => {
    const {
        config,
        model,
        definition,
        verdict,
        activePreset,
        setLeadPct,
        setDealPct,
        setAnswer,
        applyPreset,
        applyRecommended,
        reset,
        openedStage,
        openedSatellite,
        openStage,
        openSatellite,
        closeStage,
        closeSatellite,
        setLists,
        isListsOpen,
        setListsOpen,
    } = useSalesProcess();

    // Пришли из теории по кнопке «Посмотреть на схеме» — доводим до места.
    useScrollToTarget(true);

    const recommendedPreset =
        SALES_PRESETS.find(preset => preset.recommended) ?? SALES_PRESETS[0]!;

    const unansweredCount = SALES_QUESTIONS.filter(
        question => question.isActive && !config.answers[question.id],
    ).length;

    return (
        <ProcessShell
            eyebrow={SALES_PAGE_META.eyebrow}
            title={SALES_PAGE_META.title}
        >
            <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-8">
                <header>
                    <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                        {SALES_PAGE_META.title}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-lg">
                        {SALES_PAGE_META.description}
                    </p>
                </header>

                {/* 1. Один быстрый путь для тех, кто не хочет разбираться. */}

                <FillRecommended
                    presetLabel={recommendedPreset.label}
                    unanswered={unansweredCount}
                    onApply={applyRecommended}
                    onReset={reset}
                />

                {/* 2. Решения: они задают всё остальное. */}

                <QuestionPanel
                    questions={SALES_QUESTIONS}
                    answers={config.answers}
                    onAnswer={setAnswer}
                />

                {/* 3. Соотношение лид/сделка и хребет процесса. */}

                <ControlPanel
                    leadPct={config.leadPct}
                    dealPct={config.dealPct}
                    presets={SALES_PRESETS}
                    activePresetId={activePreset?.id ?? null}
                    verdict={verdict}
                    onLeadChange={setLeadPct}
                    onDealChange={setDealPct}
                    onApplyPreset={applyPreset}
                />

                <SpineCanvas model={model} onSelectStage={openStage} />

                <CallsPlacement placement={model.callsApp} />

                {/* 4. Процесс по стадиям и параллельные воронки. */}

                <ProcessFlow model={model} />

                <SatelliteRail
                    satellites={model.satellites}
                    onSelect={openSatellite}
                />

                <ProcessEdges
                    entryPoints={model.entryPoints}
                    exits={model.exits}
                />

                <Button
                    variant="outline"
                    onClick={() => setListsOpen(true)}
                    className="w-fit gap-1.5"
                >
                    <ListTree className="size-4" />
                    Стадии и статусы: лид и заявка
                </Button>

                {/* 5. Итог, который заказчик уносит с собой. */}

                <RegulationPanel
                    definition={definition}
                    model={model}
                    config={config}
                    preset={activePreset}
                />

                {/* Страница длинная: в конце человек не должен упираться в тупик. */}
                <div className="border-t pt-6">
                    <p className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                        Куда дальше
                    </p>
                    <SectionNav currentSlug="schema" />
                </div>
            </div>

            <EntityListsDialog
                open={isListsOpen}
                onOpenChange={setListsOpen}
                config={config}
                onChange={setLists}
            />

            <ProcessDialog
                open={openedStage !== null}
                onOpenChange={open => !open && closeStage()}
                title={openedStage?.stage.label ?? ''}
                description={openedStage?.stage.hint}
            >
                {openedStage && (
                    <StageDetail
                        satellites={model.satellites}
                        view={openedStage}
                        kpiSource={model.kpiSource}
                    />
                )}
            </ProcessDialog>

            <ProcessDialog
                open={openedSatellite !== null}
                onOpenChange={open => !open && closeSatellite()}
                title={openedSatellite?.label ?? ''}
                description={openedSatellite?.summary}
            >
                {openedSatellite && (
                    <SatelliteDetail satellite={openedSatellite} />
                )}
            </ProcessDialog>
        </ProcessShell>
    );
};
