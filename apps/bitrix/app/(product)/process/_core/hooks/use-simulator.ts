'use client';

import { useCallback, useMemo, useState } from 'react';
import { SALES_PROCESS } from '../constants/sales-process';
import {
    addSimTask,
    applyReport,
    backToSimList,
    createSimState,
    firstHumanStageIndex,
    openSimTask,
    passToManager,
    setSimWorkplace,
    simPlace,
} from '../lib/simulator.util';
import type {
    SimGateOutcome,
    SimReport,
    SimState,
    SimWorkplace,
} from '../lib/simulator.util';
import { useProcessConfig } from './use-process-config';

/**
 * Прохождение процесса шаг за шагом на текущей конфигурации портала.
 *
 * Конфигурация берётся из того же стора, что и схема, поэтому симулятор
 * показывает именно ваш портал: где стоят «Звонки», кто ведёт стадию, куда
 * можно свернуть.
 */
export const useSimulator = () => {
    const { config, model, activePreset } = useProcessConfig(SALES_PROCESS);
    const [state, setState] = useState<SimState | null>(null);

    const startIndex = useMemo(() => firstHumanStageIndex(model), [model]);

    const start = useCallback(
        (
            entryPointId: string,
            company: string,
            stageIndex: number,
            eventCode: string,
            isManagerMode = false,
        ) =>
            setState(() => {
                /**
                 * Стартуем ДО передачи в работу, если начинаем со стадии, где
                 * работает администратор: там ещё нет ни сделки, ни воронки
                 * холодного обзвона, ни задачи — всё это заводит один хук в
                 * момент передачи менеджеру.
                 */
                const startsBeforeHandover =
                    !isManagerMode && model.stages[stageIndex]?.actor === 'adm';

                const next = createSimState(
                    entryPointId,
                    company,
                    stageIndex,
                    eventCode,
                    !startsBeforeHandover,
                );

                /**
                 * В режиме менеджера разбор входа не показывается вовсе:
                 * клиент просто появляется в списке дел. Поэтому стартуем не
                 * раньше первой стадии, где работает менеджер, — иначе
                 * пришлось бы рисовать экран, которого менеджер не видит.
                 */
                if (!isManagerMode) return { ...next, isManagerMode };

                const managerIndex = model.stages.findIndex(
                    view => view.actor === 'mgr',
                );

                return {
                    ...next,
                    isManagerMode,
                    companyKnown: true,
                    stageIndex: Math.max(next.stageIndex, managerIndex),
                };
            }),
        [model],
    );

    const setWorkplace = useCallback(
        (workplace: SimWorkplace) =>
            setState(current =>
                current === null
                    ? current
                    : setSimWorkplace(current, workplace),
            ),
        [],
    );

    const submit = useCallback(
        (report: SimReport) =>
            setState(current =>
                current === null
                    ? current
                    : applyReport({
                          state: current,
                          report,
                          definition: SALES_PROCESS,
                          model,
                          // Индекс записи достаточно уникален: лог только растёт.
                          entryId: `step-${current.log.length + 1}`,
                      }),
            ),
        [model],
    );

    const openTask = useCallback(
        (taskId: string) =>
            setState(current =>
                current === null ? current : openSimTask(current, taskId),
            ),
        [],
    );

    const backToList = useCallback(
        () =>
            setState(current =>
                current === null ? current : backToSimList(current),
            ),
        [],
    );

    const addTask = useCallback(
        (eventCode: string) =>
            setState(current =>
                current === null
                    ? current
                    : addSimTask(current, eventCode, SALES_PROCESS),
            ),
        [],
    );

    /** Разбор входа администратором — передача клиента дальше. */
    const passGate = useCallback(
        (outcome: SimGateOutcome) =>
            setState(current =>
                current === null
                    ? current
                    : passToManager({
                          state: current,
                          outcome,
                          definition: SALES_PROCESS,
                          model,
                          entryId: `step-${current.log.length + 1}`,
                      }),
            ),
        [model],
    );

    const reset = useCallback(() => setState(null), []);

    const stageView = state ? model.stages[state.stageIndex] : undefined;

    return {
        config,
        model,
        activePreset,
        definition: SALES_PROCESS,
        state,
        startIndex,
        stageView,
        place: state ? simPlace(model, state.stageIndex) : '—',
        activeTask:
            state?.tasks.find(task => task.id === state.activeTaskId) ?? null,
        start,
        submit,
        openTask,
        backToList,
        addTask,
        passGate,
        setWorkplace,
        reset,
    };
};
