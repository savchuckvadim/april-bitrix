import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    markBootPhase,
    readBootPhases,
    type BootPhaseRow,
} from './boot-phases';
import {
    armBootMetricsWatchdog,
    buildBootObservations,
    BOOT_WATCHDOG_MS,
    reportBootMetrics,
    resetBootMetricsForTests,
} from './boot-metrics';

/**
 * Первая загрузка — главное требование владельца. Проверяем ровно то, на чём
 * она может соврать: отсчёт идёт от навигации (а не от момента, когда бандл
 * уже скачан и разобран), фазы уезжают один раз за загрузку документа, ⟳ до
 * отправки не склеивает два бута в один, зависший бут отправляется сторожем,
 * а неполный — без выдуманной цифры «до списка дел».
 *
 * Метки ставятся НАСТОЯЩИЕ (`performance.mark` есть и в Node) — так тест
 * проверяет весь путь от метки до наблюдения, а не собственную выдумку про
 * форму сводки.
 */

const phases = vi.hoisted(() => ({
    observed: [] as Array<{ phase: string; seconds: number; domain?: unknown }>,
    total: [] as Array<{ seconds: number; domain?: unknown }>,
}));

vi.mock('@/modules/shared/metrics/lib/business-metrics', () => ({
    observeBootPhase: (params: {
        phase: string;
        seconds: number;
        domain?: unknown;
    }) => phases.observed.push(params),
    observeBootToTasks: (params: { seconds: number; domain?: unknown }) =>
        phases.total.push(params),
}));

beforeEach(() => {
    performance.clearMarks();
    phases.observed.length = 0;
    phases.total.length = 0;
    resetBootMetricsForTests();
});

afterEach(() => {
    performance.clearMarks();
    resetBootMetricsForTests();
    vi.useRealTimers();
});

const observedPhases = (): string[] => phases.observed.map(item => item.phase);

const secondsOf = (phase: string): number | undefined =>
    phases.observed.find(item => item.phase === phase)?.seconds;

/**
 * Подделываем ТОЛЬКО таймеры. По умолчанию vitest подменяет заодно и
 * `performance` — а на нём держатся сами метки бута, и сторож проверялся бы
 * на пустой сводке.
 */
const useTimerFakes = (): void => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
};

describe('buildBootObservations', () => {
    it('переводит мс от начала в секунды и сохраняет порядок фаз', () => {
        const rows: BootPhaseRow[] = [
            { phase: 'init-start', fromStartMs: 0, stepMs: 0 },
            { phase: 'bitrix-started', fromStartMs: 500, stepMs: 500 },
            { phase: 'tasks-fetched', fromStartMs: 2400, stepMs: 1900 },
        ];

        expect(buildBootObservations(rows)).toEqual([
            { phase: 'init-start', seconds: 0 },
            { phase: 'bitrix-started', seconds: 0.5 },
            { phase: 'tasks-fetched', seconds: 2.4 },
        ]);
    });

    it('синтетическую document-start в метрики не отправляет', () => {
        const rows: BootPhaseRow[] = [
            { phase: 'document-start', fromStartMs: 0, stepMs: 0 },
            { phase: 'init-start', fromStartMs: 1500, stepMs: 1500 },
        ];

        expect(buildBootObservations(rows)).toEqual([
            { phase: 'init-start', seconds: 1.5 },
        ]);
    });

    it('пустая сводка — пустой список, а не выдуманный ноль', () => {
        expect(buildBootObservations([])).toEqual([]);
    });
});

describe('первая загрузка отсчитывается от навигации', () => {
    it('сводка начинается с document-start, а init-start несёт цену бандла', () => {
        // Момент навигации уже позади: в Node `performance.now()` растёт от
        // старта процесса ровно так же, как в браузере от timeOrigin.
        const beforeInit = performance.now();
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');

        const rows = readBootPhases();

        expect(rows[0]).toEqual({
            phase: 'document-start',
            fromStartMs: 0,
            stepMs: 0,
        });
        const initRow = rows.find(row => row.phase === 'init-start');
        // До правки здесь стоял ровно ноль: всё, что было до init-start,
        // вычиталось — то есть выбрасывалась бо́льшая часть ожидания.
        expect(initRow?.fromStartMs).toBeGreaterThanOrEqual(
            Math.floor(beforeInit),
        );
        expect(initRow?.stepMs).toBe(initRow?.fromStartMs);
    });

    it('главная цифра до списка дел включает загрузку документа', () => {
        const beforeInit = performance.now();
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');

        reportBootMetrics('a.bitrix24.ru');

        expect(secondsOf('init-start')).toBeGreaterThan(0);
        expect(phases.total).toHaveLength(1);
        expect(phases.total[0]!.seconds * 1000).toBeGreaterThanOrEqual(
            Math.floor(beforeInit),
        );
        // document-start серию не заводит — наблюдение по определению ноль.
        expect(observedPhases()).not.toContain('document-start');
    });
});

describe('отправка фаз первой загрузки', () => {
    it('уезжают все наступившие фазы и главная цифра до списка дел', () => {
        markBootPhase('init-start');
        markBootPhase('bitrix-started');
        markBootPhase('tasks-fetched');

        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toEqual([
            'init-start',
            'bitrix-started',
            'tasks-fetched',
        ]);
        expect(
            phases.observed.every(item => item.domain === 'a.bitrix24.ru'),
        ).toBe(true);
        expect(phases.total).toHaveLength(1);
    });

    it('за одну загрузку отчёт уходит РОВНО один раз', () => {
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');

        reportBootMetrics('a.bitrix24.ru');
        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toEqual(['init-start', 'tasks-fetched']);
        expect(phases.total).toHaveLength(1);
    });

    it('перезагрузка по ⟳ второй «первой загрузки» не даёт', () => {
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');
        reportBootMetrics('a.bitrix24.ru');
        phases.observed.length = 0;
        phases.total.length = 0;

        // ⟳: инициализация идёт заново в той же вкладке, метки копятся
        // поверх прежних — но отчёт за эту загрузку документа уже уехал.
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');
        reportBootMetrics('a.bitrix24.ru');

        expect(phases.observed).toEqual([]);
        expect(phases.total).toEqual([]);
    });

    it('неполный бут отправляется, но цифру до списка дел не выдумывает', () => {
        // Гвард «чужая задача»: сплэш снят, список дел не запрашивался вовсе.
        markBootPhase('init-start');
        markBootPhase('bitrix-started');
        markBootPhase('splash-off');

        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toEqual([
            'init-start',
            'bitrix-started',
            'splash-off',
        ]);
        expect(phases.total).toEqual([]);
    });

    it('меток нет вовсе — молчим и права на отчёт не теряем', () => {
        reportBootMetrics('a.bitrix24.ru');
        expect(phases.observed).toEqual([]);

        markBootPhase('init-start');
        markBootPhase('tasks-fetched');
        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toEqual(['init-start', 'tasks-fetched']);
    });
});

describe('⟳ ДО отправки: считается последний бут, а не сумма двух', () => {
    it('отчёт содержит фазы второго бута по одному разу', () => {
        // Первый бут идёт медленно и до отчёта не доживает.
        markBootPhase('init-start');
        markBootPhase('bitrix-started');
        markBootPhase('portal-fetched');

        // Менеджер жмёт ⟳ именно потому, что медленно.
        markBootPhase('init-start');
        markBootPhase('bitrix-started');
        markBootPhase('tasks-fetched');

        reportBootMetrics('a.bitrix24.ru');

        // Ни удвоенных наблюдений, ни хвоста первого бута: до правки
        // отсчёт шёл от ПЕРВОЙ метки и складывал оба ожидания в одну цифру.
        expect(observedPhases()).toEqual([
            'init-start',
            'bitrix-started',
            'tasks-fetched',
        ]);
        expect(phases.total).toHaveLength(1);
    });

    it('второй бут отсчитывается от своего init-start, а не от навигации', () => {
        markBootPhase('init-start');
        markBootPhase('bitrix-started');
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');

        const rows = readBootPhases();

        // Загрузки документа у повторного бута не было — начала таймлайна
        // на навигации у него тоже нет.
        expect(rows.map(row => row.phase)).toEqual([
            'init-start',
            'tasks-fetched',
        ]);
        expect(rows[0]!.fromStartMs).toBe(0);
        expect(rows[1]!.fromStartMs).toBeLessThan(1000);
    });
});

describe('фаза за бут наступает один раз', () => {
    it('повторный setPortal второго наблюдения portal-fetched не даёт', () => {
        markBootPhase('init-start');
        // PortalService диспатчит setPortal дважды: первичный ответ и
        // фоновое обновление кэша. Метка обязана встать один раз.
        markBootPhase('portal-fetched');
        markBootPhase('portal-fetched');
        markBootPhase('tasks-fetched');

        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toEqual([
            'init-start',
            'portal-fetched',
            'tasks-fetched',
        ]);
    });

    it('новый бут право на фазу возвращает', () => {
        markBootPhase('init-start');
        markBootPhase('portal-fetched');
        markBootPhase('init-start');
        markBootPhase('portal-fetched');
        markBootPhase('tasks-fetched');

        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toEqual([
            'init-start',
            'portal-fetched',
            'tasks-fetched',
        ]);
    });
});

describe('исход списка дел', () => {
    it('пустой список — главная цифра уходит, исход помечен', () => {
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');
        markBootPhase('tasks-empty');

        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toContain('tasks-empty');
        // Раньше на этом классе загрузок главная цифра молчала вовсе.
        expect(phases.total).toHaveLength(1);
    });

    it('упавший запрос отличим от «дел нет» и от «медленно»', () => {
        markBootPhase('init-start');
        markBootPhase('tasks-fetched');
        markBootPhase('tasks-error');

        reportBootMetrics('a.bitrix24.ru');

        expect(observedPhases()).toContain('tasks-error');
        expect(observedPhases()).not.toContain('tasks-empty');
        expect(phases.total).toHaveLength(1);
    });
});

describe('зависший бут: сторож отчёта', () => {
    it('по таймауту отправляет то, что успело наступить', () => {
        useTimerFakes();

        markBootPhase('init-start');
        armBootMetricsWatchdog(() => 'a.bitrix24.ru');
        // Bitrix.start не вернулся: ни одного действия, штатной точки
        // отправки не будет никогда.

        vi.advanceTimersByTime(BOOT_WATCHDOG_MS);

        expect(observedPhases()).toEqual(['init-start']);
        expect(phases.observed[0]!.domain).toBe('a.bitrix24.ru');
        // Цифру до списка дел не выдумываем — дел не было.
        expect(phases.total).toEqual([]);
    });

    it('штатный отчёт сторож снимает — второй раз не стреляет', () => {
        useTimerFakes();

        markBootPhase('init-start');
        armBootMetricsWatchdog(() => 'a.bitrix24.ru');
        markBootPhase('tasks-fetched');
        reportBootMetrics('a.bitrix24.ru');

        const afterReport = observedPhases().length;
        vi.advanceTimersByTime(BOOT_WATCHDOG_MS * 2);

        expect(observedPhases()).toHaveLength(afterReport);
        expect(phases.total).toHaveLength(1);
    });

    it('⟳ перевзводит сторож, а не заводит второй', () => {
        useTimerFakes();

        markBootPhase('init-start');
        armBootMetricsWatchdog(() => 'a.bitrix24.ru');
        markBootPhase('init-start');
        armBootMetricsWatchdog(() => 'a.bitrix24.ru');

        vi.advanceTimersByTime(BOOT_WATCHDOG_MS * 3);

        expect(observedPhases()).toEqual(['init-start']);
    });

    it('домен, неизвестный на старте, читается в момент срабатывания', () => {
        useTimerFakes();
        let domain: string | null = null;

        markBootPhase('init-start');
        armBootMetricsWatchdog(() => domain);
        domain = 'late.bitrix24.ru';

        vi.advanceTimersByTime(BOOT_WATCHDOG_MS);

        expect(phases.observed[0]!.domain).toBe('late.bitrix24.ru');
    });

    it('уход со страницы отправляет замер, не дожидаясь таймаута', () => {
        useTimerFakes();
        const listeners: Record<string, Array<() => void>> = {};
        const fakeWindow = {
            addEventListener: (name: string, handler: () => void) => {
                (listeners[name] ??= []).push(handler);
            },
            removeEventListener: (name: string, handler: () => void) => {
                listeners[name] = (listeners[name] ?? []).filter(
                    item => item !== handler,
                );
            },
        };
        const scope = globalThis as unknown as { window?: unknown };
        scope.window = fakeWindow;

        try {
            markBootPhase('init-start');
            markBootPhase('bitrix-started');
            armBootMetricsWatchdog(() => 'a.bitrix24.ru');

            expect(listeners.pagehide).toHaveLength(1);
            listeners.pagehide![0]!();

            expect(observedPhases()).toEqual(['init-start', 'bitrix-started']);
            // Подписка снята вместе со сторожем: второй отчёт невозможен.
            expect(listeners.pagehide).toHaveLength(0);
        } finally {
            delete scope.window;
        }
    });
});
