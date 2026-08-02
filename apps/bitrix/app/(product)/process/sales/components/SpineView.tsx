'use client';

import type { FC } from 'react';
import { CallsPlacement } from '../../_core/components/CallsPlacement';
import { ControlPanel } from '../../_core/components/ControlPanel';
import { FillRecommended } from '../../_core/components/FillRecommended';
import { ProcessDialog } from '../../_core/components/ProcessDialog';
import { ProcessEdges } from '../../_core/components/ProcessEdges';
import { ProcessFlow } from '../../_core/components/ProcessFlow';
import { ProcessShell } from '../../_core/components/ProcessShell';
import { QuestionPanel } from '../../_core/components/QuestionPanel';
import { RegulationPanel } from '../../_core/components/RegulationPanel';
import { SatelliteDetail } from '../../_core/components/SatelliteDetail';
import { SatelliteRail } from '../../_core/components/SatelliteRail';
import { SpineCanvas } from '../../_core/components/SpineCanvas';
import { StageDetail } from '../../_core/components/StageDetail';
import { TheoryLinks } from '../../_core/components/theory/TheoryLinks';
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

                {/* 1. Почему процесс устроен так — прежде чем его настраивать. */}

                <TheoryLinks />

                {/* 2. Один быстрый путь для тех, кто не хочет разбираться. */}

                <FillRecommended
                    presetLabel={recommendedPreset.label}
                    unanswered={unansweredCount}
                    onApply={applyRecommended}
                    onReset={reset}
                />

                {/* 3. Решения: они задают всё остальное. */}

                <QuestionPanel
                    questions={SALES_QUESTIONS}
                    answers={config.answers}
                    onAnswer={setAnswer}
                />

                {/* 4. Соотношение лид/сделка и хребет процесса. */}

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

                {/* 5. Процесс по стадиям и параллельные воронки. */}

                <ProcessFlow model={model} />

                <SatelliteRail
                    satellites={model.satellites}
                    onSelect={openSatellite}
                />

                <ProcessEdges
                    entryPoints={model.entryPoints}
                    exits={model.exits}
                />

                {/* 6. Итог, который заказчик уносит с собой. */}

                <RegulationPanel
                    definition={definition}
                    model={model}
                    config={config}
                    preset={activePreset}
                />
            </div>

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
