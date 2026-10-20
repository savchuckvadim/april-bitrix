import { describe, expect, it } from 'vitest';
import {
    LAUNCH_STATE_LABEL,
    LAUNCH_STEP_CODES,
    LAUNCH_STEP_TEXT,
    LAUNCH_TEXT,
} from '../consts/ai-analytics-launch.const';
import { buildLaunchSteps, type LaunchStepView } from './launch-steps';
import { launchRun, launchStatus, NOW } from './launch-status.test-helper';

const NO_SESSION = { cacheReset: false, rebuilt: false };

const stepOf = (
    steps: LaunchStepView[],
    code: LaunchStepView['code'],
): LaunchStepView => {
    const step = steps.find(item => item.code === code);
    if (!step) throw new Error(`нет шага ${code}`);
    return step;
};

describe('словарь панели запуска', () => {
    it('у каждого шага есть название, строка «что сделает», кнопка, подтверждение и «что дальше»', () => {
        expect(Object.keys(LAUNCH_STEP_TEXT).sort()).toEqual(
            [...LAUNCH_STEP_CODES].sort(),
        );
        for (const code of LAUNCH_STEP_CODES) {
            const text = LAUNCH_STEP_TEXT[code];
            for (const value of [
                text.title,
                text.what,
                text.button,
                text.confirm,
                text.next,
            ]) {
                expect(value.trim().length).toBeGreaterThan(0);
            }
        }
    });

    it('в названиях и кнопках нет английских кодов — тексты для владельца', () => {
        for (const code of LAUNCH_STEP_CODES) {
            const { title, button, what } = LAUNCH_STEP_TEXT[code];
            for (const value of [title, button, what]) {
                expect(value).not.toMatch(/[a-z]{3,}/i);
            }
        }
        expect(Object.keys(LAUNCH_STATE_LABEL).sort()).toEqual([
            'done',
            'running',
            'todo',
            'unknown',
        ]);
    });
});

describe('buildLaunchSteps', () => {
    it('девять шагов по порядку с номерами 1–9', () => {
        const steps = buildLaunchSteps(launchStatus(), NO_SESSION, NOW);
        expect(steps.map(step => step.code)).toEqual([...LAUNCH_STEP_CODES]);
        expect(steps.map(step => step.number)).toEqual([
            1, 2, 3, 4, 5, 6, 7, 8, 9,
        ]);
    });

    it('без сводки: «неизвестно», безопасные кнопки доступны, шаги с условием закрыты', () => {
        const steps = buildLaunchSteps(undefined, NO_SESSION, NOW);
        expect(steps.every(step => step.state === 'unknown')).toBe(true);
        expect(stepOf(steps, 'smart').enabled).toBe(true);
        for (const code of [
            'forecast-show',
            'reanalyze-run',
            'rebuild',
        ] as const) {
            expect(stepOf(steps, code)).toMatchObject({
                enabled: false,
                disabledReason: LAUNCH_TEXT.statusUnknown,
            });
        }
    });

    it('смарт и история — состояние и текст из сводки; кэш — по нажатию в сеансе', () => {
        const status = launchStatus({
            pipeline: { state: 'running', text: 'Догон идёт' },
        });
        const steps = buildLaunchSteps(status, NO_SESSION, NOW);
        expect(stepOf(steps, 'smart')).toMatchObject({
            state: 'todo',
            stateText: 'Смарту не хватает значений (2).',
        });
        expect(stepOf(steps, 'history')).toMatchObject({
            state: 'running',
            stateText: 'Догон идёт',
        });
        expect(stepOf(steps, 'cache').state).toBe('unknown');
        const after = buildLaunchSteps(
            status,
            { cacheReset: true, rebuilt: false },
            NOW,
        );
        expect(stepOf(after, 'cache')).toMatchObject({
            state: 'done',
            stateText: LAUNCH_TEXT.cacheDone,
        });
    });

    it('прогноз: показать — только при «пройдено»; уже показан — сделано', () => {
        const notPassed = buildLaunchSteps(launchStatus(), NO_SESSION, NOW);
        expect(stepOf(notPassed, 'forecast-show')).toMatchObject({
            enabled: false,
            disabledReason: LAUNCH_TEXT.showNeedsPass,
        });
        expect(stepOf(notPassed, 'forecast-check').state).toBe('todo');

        const passed = buildLaunchSteps(
            launchStatus({ forecast: { status: 'pass', replayedMonths: 7 } }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(passed, 'forecast-show').enabled).toBe(true);
        expect(stepOf(passed, 'forecast-check').state).toBe('done');
        expect(stepOf(passed, 'forecast-restore').state).toBe('done');

        const shown = buildLaunchSteps(
            launchStatus({ forecast: { status: 'pass', stageEnabled: true } }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(shown, 'forecast-show')).toMatchObject({
            state: 'done',
            enabled: false,
        });
    });

    it('восстановление: свежий месячный прогон — «идёт»', () => {
        const steps = buildLaunchSteps(
            launchStatus({
                pipeline: {
                    lastMonthly: {
                        day: '2026-09-30',
                        rhythm: 'monthly',
                        status: 'ok',
                        generatedAt: new Date(
                            NOW.getTime() - 30 * 60 * 1000,
                        ).toISOString(),
                    },
                },
            }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(steps, 'forecast-restore').state).toBe('running');
    });

    it('переразбор: запуск закрыт без подсчёта, открыт после подсчёта, идёт — закрыт, остановился — открыт', () => {
        const none = buildLaunchSteps(launchStatus(), NO_SESSION, NOW);
        expect(stepOf(none, 'reanalyze-run')).toMatchObject({
            enabled: false,
            disabledReason: LAUNCH_TEXT.runNeedsCount,
        });
        expect(stepOf(none, 'reanalyze-count')).toMatchObject({
            state: 'todo',
            enabled: true,
        });

        const counted = buildLaunchSteps(
            launchStatus({ reanalysis: { run: launchRun() } }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(counted, 'reanalyze-count').state).toBe('done');
        expect(stepOf(counted, 'reanalyze-run').enabled).toBe(true);
        expect(stepOf(counted, 'rebuild').enabled).toBe(false);

        const running = buildLaunchSteps(
            launchStatus({
                reanalysis: {
                    run: launchRun({ dryRun: false, finished: false }),
                },
            }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(running, 'reanalyze-run')).toMatchObject({
            state: 'running',
            enabled: false,
        });
        expect(stepOf(running, 'reanalyze-count').enabled).toBe(false);

        const stale = buildLaunchSteps(
            launchStatus({
                reanalysis: {
                    run: launchRun({
                        dryRun: false,
                        finished: false,
                        stale: true,
                    }),
                },
            }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(stale, 'reanalyze-run')).toMatchObject({
            state: 'todo',
            enabled: true,
        });
    });

    it('пересборка: доступна после окончания переразбора; сделано — после догона позже окончания', () => {
        const run = launchRun({
            dryRun: false,
            finished: true,
            updatedAt: '2026-10-21T08:00:00.000Z',
        });
        const finished = buildLaunchSteps(
            launchStatus({ reanalysis: { run } }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(finished, 'rebuild')).toMatchObject({
            state: 'todo',
            enabled: true,
        });
        expect(stepOf(finished, 'reanalyze-run')).toMatchObject({
            state: 'done',
            enabled: false,
        });

        const rebuilt = buildLaunchSteps(
            launchStatus({
                reanalysis: { run },
                pipeline: {
                    lastBackfill: {
                        day: '2026-09-30',
                        rhythm: 'backfill',
                        status: 'ok',
                        generatedAt: '2026-10-21T09:00:00.000Z',
                    },
                },
            }),
            NO_SESSION,
            NOW,
        );
        expect(stepOf(rebuilt, 'rebuild').state).toBe('done');
        const session = buildLaunchSteps(
            launchStatus({ reanalysis: { run } }),
            { cacheReset: true, rebuilt: true },
            NOW,
        );
        expect(stepOf(session, 'rebuild').state).toBe('done');
    });
});
