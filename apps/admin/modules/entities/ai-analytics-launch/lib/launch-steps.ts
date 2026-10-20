import {
    LAUNCH_STEP_CODES,
    LAUNCH_STEP_TEXT,
    LAUNCH_TEXT,
    type LaunchStepText,
} from '../consts/ai-analytics-launch.const';
import type {
    LaunchReanalysisRun,
    LaunchStatus,
    LaunchStepCode,
    LaunchStepState,
} from '../model';

/**
 * Шаги панели запуска из сводки бэка (`launch-status`) и того, что уже
 * нажато в этом сеансе: состояние, текст состояния, доступность кнопки и
 * причина, если недоступна. Чистые функции — без React и API.
 */

/** Что панель знает о нажатиях в этом сеансе (сводка их ещё не видит). */
export interface LaunchSessionState {
    cacheReset: boolean;
    rebuilt: boolean;
}

export interface LaunchStepView extends LaunchStepText {
    code: LaunchStepCode;
    number: number;
    state: LaunchStepState;
    /** Состояние словами (из сводки бэка или правила панели). */
    stateText: string;
    enabled: boolean;
    /** Почему кнопка недоступна; null — доступна. */
    disabledReason: string | null;
}

interface StepState {
    state: LaunchStepState;
    stateText: string;
    enabled?: boolean;
    disabledReason?: string | null;
}

/**
 * Шаги с условием доступности (пройденная проверка, готовый подсчёт,
 * законченный переразбор): без сводки их кнопки закрыты — условие не
 * проверить. Остальные шаги безопасны и без сводки.
 */
const GATED_STEPS: readonly LaunchStepCode[] = [
    'forecast-show',
    'reanalyze-run',
    'rebuild',
];

const unknownState = (code: LaunchStepCode): StepState => {
    const gated = GATED_STEPS.includes(code);
    return {
        state: 'unknown',
        stateText: LAUNCH_TEXT.statusUnknown,
        enabled: !gated,
        disabledReason: gated ? LAUNCH_TEXT.statusUnknown : null,
    };
};

const HOUR_MS = 60 * 60 * 1000;

/** Прогон моложе трёх часов — ещё идёт (как окно «идёт» на бэке). */
const isFresh = (iso: string | null | undefined, now: Date): boolean => {
    if (!iso) return false;
    const at = Date.parse(iso);
    return Number.isFinite(at) && now.getTime() - at < 3 * HOUR_MS;
};

/** Идущий (не остановившийся) боевой переразбор. */
export const isReanalysisRunning = (run: LaunchReanalysisRun | null): boolean =>
    run !== null && !run.dryRun && !run.finished && !run.stale;

function restoreState(status: LaunchStatus, now: Date): StepState {
    const { forecast, pipeline } = status;
    if (forecast.state === 'unknown') {
        return { state: 'unknown', stateText: forecast.text };
    }
    const replayed = forecast.replayedMonths ?? 0;
    if (replayed > 0) {
        return {
            state: 'done',
            stateText: `Восстановлено по истории месяцев: ${replayed}.`,
        };
    }
    if (isFresh(pipeline.lastMonthly?.generatedAt, now)) {
        return {
            state: 'running',
            stateText:
                'Пересчёт месяца недавно шёл — проверьте точность через 10–30 минут.',
        };
    }
    return {
        state: 'todo',
        stateText: 'Прогноз по истории ещё не восстанавливали.',
    };
}

function showState(status: LaunchStatus): StepState {
    const { forecast } = status;
    if (forecast.stageEnabled === true) {
        return {
            state: 'done',
            stateText: LAUNCH_TEXT.showAlreadyOn,
            enabled: false,
            disabledReason: LAUNCH_TEXT.showAlreadyOn,
        };
    }
    const passed = forecast.status === 'pass';
    return {
        state: forecast.state === 'unknown' ? 'unknown' : 'todo',
        stateText: forecast.text,
        enabled: passed,
        disabledReason: passed ? null : LAUNCH_TEXT.showNeedsPass,
    };
}

function countState(run: LaunchReanalysisRun | null, text: string): StepState {
    if (isReanalysisRunning(run)) {
        return {
            state: 'done',
            stateText: text,
            enabled: false,
            disabledReason: LAUNCH_TEXT.countBlockedByRun,
        };
    }
    if (run === null) return { state: 'todo', stateText: text };
    if (run.dryRun && !run.finished)
        return { state: 'running', stateText: text };
    return { state: 'done', stateText: text };
}

function runState(run: LaunchReanalysisRun | null, text: string): StepState {
    if (run === null) {
        return {
            state: 'todo',
            stateText: LAUNCH_TEXT.runNeedsCount,
            enabled: false,
            disabledReason: LAUNCH_TEXT.runNeedsCount,
        };
    }
    if (run.dryRun) {
        return {
            state: 'todo',
            stateText: text,
            enabled: run.finished,
            disabledReason: run.finished ? null : LAUNCH_TEXT.runNeedsCount,
        };
    }
    if (run.finished) {
        return {
            state: 'done',
            stateText: text,
            enabled: false,
            disabledReason: LAUNCH_TEXT.runFinished,
        };
    }
    if (run.stale) return { state: 'todo', stateText: text, enabled: true };
    return {
        state: 'running',
        stateText: text,
        enabled: false,
        disabledReason: LAUNCH_TEXT.runInProgress,
    };
}

function rebuildState(
    status: LaunchStatus,
    session: LaunchSessionState,
): StepState {
    const run = status.reanalysis.run;
    const finished = run !== null && !run.dryRun && run.finished;
    if (!finished) {
        return {
            state: 'todo',
            stateText: LAUNCH_TEXT.rebuildNeedsRun,
            enabled: false,
            disabledReason: LAUNCH_TEXT.rebuildNeedsRun,
        };
    }
    const backfillAt = status.pipeline.lastBackfill?.generatedAt ?? '';
    const rebuilt = session.rebuilt || backfillAt > run.updatedAt;
    return {
        state: rebuilt ? 'done' : 'todo',
        stateText: rebuilt
            ? 'Витрина пересобрана после переразбора.'
            : 'Переразбор закончен — пересоберите витрину.',
    };
}

function stepState(
    code: LaunchStepCode,
    status: LaunchStatus,
    session: LaunchSessionState,
    now: Date,
): StepState {
    const run = status.reanalysis.run;
    switch (code) {
        case 'smart':
            return { state: status.smart.state, stateText: status.smart.text };
        case 'cache':
            return session.cacheReset
                ? { state: 'done', stateText: LAUNCH_TEXT.cacheDone }
                : { state: 'unknown', stateText: LAUNCH_TEXT.cacheUntracked };
        case 'history':
            return {
                state: status.pipeline.state,
                stateText: status.pipeline.text,
            };
        case 'forecast-restore':
            return restoreState(status, now);
        case 'forecast-check':
            return {
                state:
                    status.forecast.status === 'pass'
                        ? 'done'
                        : status.forecast.state === 'unknown'
                          ? 'unknown'
                          : 'todo',
                stateText: status.forecast.text,
            };
        case 'forecast-show':
            return showState(status);
        case 'reanalyze-count':
            return countState(run, status.reanalysis.text);
        case 'reanalyze-run':
            return runState(run, status.reanalysis.text);
        case 'rebuild':
            return rebuildState(status, session);
    }
}

/**
 * Шаги панели по порядку; без сводки — «неизвестно», безопасные кнопки
 * доступны, кнопки с условием закрыты.
 */
export function buildLaunchSteps(
    status: LaunchStatus | undefined,
    session: LaunchSessionState,
    now: Date,
): LaunchStepView[] {
    return LAUNCH_STEP_CODES.map((code, index) => {
        const state = status
            ? stepState(code, status, session, now)
            : unknownState(code);
        const enabled = state.enabled ?? true;
        return {
            ...LAUNCH_STEP_TEXT[code],
            code,
            number: index + 1,
            state: state.state,
            stateText: state.stateText,
            enabled,
            disabledReason: enabled ? null : (state.disabledReason ?? null),
        };
    });
}
