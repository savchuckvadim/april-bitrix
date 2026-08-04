'use client';

import type { FC } from 'react';
import { ArrowLeft, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ProcessShell } from '../../../_core/components/ProcessShell';
import { SectionNav } from '../../../_core/components/SectionNav';
import { ACTOR_LABEL } from '../../../_core/lib/actor.util';
import { findEventType } from '../../../_core/constants/sim-events';
import { SimAdminGate } from '../../../_core/components/sim/SimAdminGate';
import { SimCallForm } from '../../../_core/components/sim/SimCallForm';
import { SimFunnels } from '../../../_core/components/sim/SimFunnels';
import { SimGuide } from '../../../_core/components/sim/SimGuide';
import { SimJourney } from '../../../_core/components/sim/SimJourney';
import { SimLog } from '../../../_core/components/sim/SimLog';
import { SimOutcome } from '../../../_core/components/sim/SimOutcome';
import { SimStart } from '../../../_core/components/sim/SimStart';
import { SimSummary } from '../../../_core/components/sim/SimSummary';
import { SimStatusBar } from '../../../_core/components/sim/SimStatusBar';
import { SimTaskList } from '../../../_core/components/sim/SimTaskList';
import { SimWorkplacePicker } from '../../../_core/components/sim/SimWorkplacePicker';
import { useSimHints } from '../../../_core/hooks/use-sim-hints';
import { useSimulator } from '../../../_core/hooks/use-simulator';
import type { SimAnchor } from '../../../_core/constants/sim-hints';
import { SIMULATOR_META } from '../constants/copy';

/**
 * Симулятор рабочего места.
 *
 * До запуска это обычная страница раздела: заголовок, описание, навигация.
 * После запуска всё это уходит — остаётся только рабочее место и узкая
 * подпись, что происходит. Причина простая: пока на экране висят заголовок и
 * ссылки «куда дальше», человек читает страницу. А он должен работать.
 */
export const SimulatorView: FC = () => {
    const {
        definition,
        model,
        activePreset,
        state,
        startIndex,
        stageView,
        place,
        activeTask,
        start,
        submit,
        openTask,
        backToList,
        addTask,
        passGate,
        setWorkplace,
        reset,
    } = useSimulator();

    const isFinished = state?.status === 'sale' || state?.status === 'fail';
    const isRunning = state !== null && stageView !== undefined;

    /**
     * На стадии администратора формы «Звонки» нет: при рекомендованной схеме
     * приложение живёт в сделке, а вход разбирают в лиде. В режиме менеджера
     * этот экран не показывается вовсе — менеджер его не видит.
     */
    const isAdminGate = stageView?.actor === 'adm' && !state?.isManagerMode;

    /** Обе сущности держат стадию — значит выбирает менеджер. */
    const isOverlap = stageView?.owner === 'both';

    /**
     * Подсказки объясняют, ПОЧЕМУ вы видите этот экран. Контекст собирается из
     * того же состояния, что рисует экран, — значит соврать он не может.
     */
    const hintContext = state
        ? {
              state,
              model,
              stageView,
              activeTask,
              isAdminGate,
              isOverlap,
              isFinished,
          }
        : null;

    const hints = useSimHints(hintContext);

    const guide = (anchor: SimAnchor) => (
        <SimGuide
            anchor={anchor}
            hint={hints.active}
            text={
                hints.active && hintContext
                    ? hints.active.text(hintContext)
                    : ''
            }
            onDismiss={() => hints.active && hints.dismiss(hints.active.id)}
        />
    );

    /** Куда потянет план — подпись берём из определения, а не дублируем. */
    const plannedStageLabel = (eventCode: string): string => {
        const event = findEventType(eventCode);
        return (
            definition.stages.find(stage => stage.id === event?.targetStageId)
                ?.label ?? '—'
        );
    };

    return (
        <ProcessShell
            eyebrow={SIMULATOR_META.eyebrow}
            title={SIMULATOR_META.title}
        >
            <div
                className={
                    isRunning
                        ? 'mx-auto flex max-w-screen-2xl flex-col gap-5 px-4 py-5 sm:px-6'
                        : 'mx-auto flex max-w-screen-xl flex-col gap-6 px-4 py-6 sm:px-8'
                }
            >
                {!isRunning && (
                    <header>
                        <h1 className="text-foreground text-3xl font-semibold tracking-tight text-balance">
                            {SIMULATOR_META.title}
                        </h1>
                        <p className="text-muted-foreground mt-2 max-w-3xl text-lg font-light">
                            {SIMULATOR_META.description}
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Настройки берутся со страницы «Схема процесса»:{' '}
                            <span className="text-foreground font-medium">
                                {activePreset
                                    ? activePreset.label
                                    : 'своя комбинация'}
                            </span>{' '}
                            — лид{' '}
                            {model.stages.filter(v => v.isLeadCovered).length}{' '}
                            из {model.stages.length} стадий, сделка{' '}
                            {model.stages.filter(v => v.isDealCovered).length}.
                        </p>
                    </header>
                )}

                {!isRunning ? (
                    <>
                        <SimStart
                            model={model}
                            startIndex={startIndex}
                            onStart={start}
                        />

                        <div className="border-t pt-6">
                            <p className="text-muted-foreground mb-3 text-xs tracking-widest uppercase">
                                Куда дальше
                            </p>
                            <SectionNav currentSlug="simulator" />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Единственная подпись, которая остаётся в работе. */}
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <p className="text-muted-foreground text-xs tracking-widest uppercase">
                                {state.isManagerMode
                                    ? 'Рабочее место менеджера'
                                    : 'Прохождение процесса'}
                            </p>
                            <span className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={hints.toggle}
                                    aria-pressed={!hints.isOff}
                                    title={
                                        hints.isOff
                                            ? 'Включить подсказки'
                                            : 'Выключить подсказки'
                                    }
                                    className={
                                        hints.isOff
                                            ? 'text-muted-foreground h-7 gap-1.5 px-2 text-xs'
                                            : 'text-primary h-7 gap-1.5 px-2 text-xs'
                                    }
                                >
                                    <Lightbulb className="size-3.5" />
                                    Подсказки
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={reset}
                                    className="text-muted-foreground h-7 gap-1.5 px-2 text-xs"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Начать заново
                                </Button>
                            </span>
                        </div>

                        <SimJourney
                            definition={definition}
                            model={model}
                            stageIndex={state.stageIndex}
                            maxReachedIndex={state.stageIndex}
                        />

                        {guide('status')}

                        <SimStatusBar
                            state={state}
                            stageView={stageView}
                            place={place}
                        />

                        {guide('workplace')}

                        {isOverlap && !isFinished && (
                            <SimWorkplacePicker
                                value={state.workplace}
                                onChange={setWorkplace}
                                isCompanyKnown={state.companyKnown !== false}
                            />
                        )}

                        {isFinished ? (
                            <>
                                <SimOutcome
                                    status={state.status as 'sale' | 'fail'}
                                    company={state.company}
                                    steps={state.log.length}
                                    onRestart={reset}
                                />

                                {/*
                                 * После финала путь не исчезает: разбор — самое
                                 * ценное, что осталось от прохождения.
                                 */}
                                {guide('summary')}

                                <div className="grid gap-5 lg:grid-cols-2">
                                    <SimSummary log={state.log} />

                                    <div className="flex flex-col gap-2">
                                        <p className="text-muted-foreground text-xs tracking-widest uppercase">
                                            Весь путь
                                        </p>
                                        <SimLog log={state.log} />
                                    </div>
                                </div>

                                <SimFunnels
                                    state={state}
                                    definition={definition}
                                    model={model}
                                />
                            </>
                        ) : (
                            <>
                                {guide('funnels')}

                                <SimFunnels
                                    state={state}
                                    definition={definition}
                                    model={model}
                                />

                                <div
                                    className={
                                        activeTask
                                            ? 'flex flex-col gap-5'
                                            : 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]'
                                    }
                                >
                                    {isAdminGate ? (
                                        <div className="flex flex-col">
                                            {guide('gate')}
                                            <SimAdminGate
                                                company={state.company}
                                                actorLabel={
                                                    ACTOR_LABEL[
                                                        stageView?.actor ??
                                                            'adm'
                                                    ]
                                                }
                                                onPass={passGate}
                                            />
                                        </div>
                                    ) : activeTask ? (
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={backToList}
                                                className="w-fit gap-1.5"
                                            >
                                                <ArrowLeft className="size-4" />
                                                К списку дел
                                            </Button>
                                            {guide('form')}
                                            <SimCallForm
                                                reportedEventCode={
                                                    activeTask.eventCode
                                                }
                                                taskTitle={activeTask.title}
                                                plannedStageLabel={
                                                    plannedStageLabel
                                                }
                                                onSubmit={submit}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {guide('tasks')}
                                            <SimTaskList
                                                tasks={state.tasks}
                                                company={state.company}
                                                onOpen={openTask}
                                                onAdd={addTask}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <p className="text-muted-foreground text-xs tracking-widest uppercase">
                                            Что уже произошло
                                        </p>
                                        {guide('log')}
                                        <SimLog log={state.log} />
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </ProcessShell>
    );
};
