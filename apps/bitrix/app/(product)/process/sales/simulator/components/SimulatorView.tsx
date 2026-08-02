'use client';

import type { FC } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ProcessShell } from '../../../_core/components/ProcessShell';
import { ACTOR_LABEL } from '../../../_core/lib/actor.util';
import { findEventType } from '../../../_core/constants/sim-events';
import { SimAdminGate } from '../../../_core/components/sim/SimAdminGate';
import { SimCallForm } from '../../../_core/components/sim/SimCallForm';
import { SimFunnels } from '../../../_core/components/sim/SimFunnels';
import { SimLog } from '../../../_core/components/sim/SimLog';
import { SimOutcome } from '../../../_core/components/sim/SimOutcome';
import { SimStart } from '../../../_core/components/sim/SimStart';
import { SimSummary } from '../../../_core/components/sim/SimSummary';
import { SimStatusBar } from '../../../_core/components/sim/SimStatusBar';
import { SimTaskList } from '../../../_core/components/sim/SimTaskList';
import { useSimulator } from '../../../_core/hooks/use-simulator';
import { SIMULATOR_META } from '../constants/copy';

/**
 * Симулятор рабочего места.
 *
 * Проходим процесс шаг за шагом на текущей конфигурации портала: видно, где вы
 * находитесь, кто вы на этой стадии, что нужно сделать — и что система делает
 * сама после каждой отправки формы. Дойти можно и до продажи, и до отказа.
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
        reset,
    } = useSimulator();

    const isFinished = state?.status === 'sale' || state?.status === 'fail';

    /**
     * На стадии администратора формы «Звонки» нет: при рекомендованной схеме
     * приложение живёт в сделке, а вход разбирают в лиде.
     */
    const isAdminGate = stageView?.actor === 'adm';

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
            <div className="mx-auto flex max-w-screen-xl flex-col gap-5 px-4 py-6 sm:px-8">
                <header>
                    <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance">
                        {SIMULATOR_META.title}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-lg">
                        {SIMULATOR_META.description}
                    </p>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Настройки берутся со страницы «Схема процесса»:{' '}
                        <span className="text-foreground font-semibold">
                            {activePreset
                                ? activePreset.label
                                : 'своя комбинация'}
                        </span>{' '}
                        — лид {model.stages.filter(v => v.isLeadCovered).length}{' '}
                        из {model.stages.length} стадий, сделка{' '}
                        {model.stages.filter(v => v.isDealCovered).length}.
                    </p>
                </header>

                {state === null || stageView === undefined ? (
                    <SimStart
                        definition={definition}
                        model={model}
                        startIndex={startIndex}
                        onStart={start}
                    />
                ) : (
                    <>
                        <SimStatusBar
                            state={state}
                            stageView={stageView}
                            place={place}
                        />

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
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <SimSummary log={state.log} />

                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                                            Весь путь
                                        </h2>
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
                                <SimFunnels
                                    state={state}
                                    definition={definition}
                                    model={model}
                                />

                                <div
                                    className={
                                        activeTask
                                            ? 'flex flex-col gap-5'
                                            : 'grid gap-5 lg:grid-cols-2'
                                    }
                                >
                                    {isAdminGate ? (
                                        <SimAdminGate
                                            company={state.company}
                                            actorLabel={
                                                ACTOR_LABEL[
                                                    stageView?.actor ?? 'adm'
                                                ]
                                            }
                                            onPass={passGate}
                                        />
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
                                        <SimTaskList
                                            tasks={state.tasks}
                                            company={state.company}
                                            onOpen={openTask}
                                            onAdd={addTask}
                                        />
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                                            Что уже произошло
                                        </h2>
                                        <SimLog log={state.log} />
                                    </div>
                                </div>
                            </>
                        )}

                        {!isFinished && state.log.length > 0 && (
                            <Button
                                variant="ghost"
                                onClick={reset}
                                className="w-fit gap-1.5"
                            >
                                <RotateCcw className="size-4" />
                                Начать заново
                            </Button>
                        )}
                    </>
                )}
            </div>
        </ProcessShell>
    );
};
