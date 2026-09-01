// Прямой путь, а не барель shared/metrics: врезка должна быть видна в
// импортах файла и подменяться тестом одной строкой.
import {
    observeBootPhase,
    observeBootToTasks,
} from '@/modules/shared/metrics/lib/business-metrics';

import {
    DOCUMENT_START_PHASE,
    readBootPhases,
    resetBootPhasesForTests,
    type BootPhaseRow,
} from './boot-phases';

/**
 * ПЕРВАЯ ЗАГРУЗКА — метриками.
 *
 * Метки фаз уже стоят (boot-phases.ts), сводка печатается в консоль вкладки,
 * но консоль видит один менеджер и только пока смотрит. Владельцу нужна
 * цифра «сколько идёт первая загрузка» графиком по всем порталам — значит
 * те же самые фазы обязаны уехать в реестр метрик.
 *
 * ОТ КАКОГО МОМЕНТА СЧИТАЕМ. От навигации (timeOrigin документа), а не от
 * `init-start`: до первой строки нашего кода менеджер ждёт TTFB, бандл и
 * гидрацию, и во фрейме это обычно бо́льшая часть ожидания. Отсчёт живёт в
 * `readBootPhases`, здесь только перевод в секунды. Разбивка «где именно
 * теряется время» никуда не делась: шаг между соседними фазами читается
 * разностью их квантилей, а `phase="init-start"` теперь показывает ровно
 * цену загрузки документа.
 *
 * ОДИН РАЗ ЗА ЗАГРУЗКУ ДОКУМЕНТА, и вот почему. Кнопка ⟳ (`reloadApp`)
 * гоняет инициализацию заново в ТОЙ ЖЕ вкладке: ставится второй `init-start`,
 * второй `tasks-fetched` и так далее. Метки при этом НЕ стираются —
 * `performance.mark` только копит, — а стирать их нельзя: на них держатся
 * сводка в консоли и вкладка DevTools → Performance. Поэтому «первая
 * загрузка» тут ровно то, чем она называется: одна на загрузку документа, а
 * перезагрузка по ⟳ — не она. Если ⟳ нажали ДО отправки (а жмут именно
 * потому, что медленно), отчёт уходит про ПОСЛЕДНИЙ бут: `readBootPhases`
 * читает окно от последней метки `init-start`, и склейки двух ожиданий в
 * одну задранную цифру не происходит.
 *
 * НЕПОЛНЫЙ БУТ ОТПРАВЛЯЕТСЯ ТОЖЕ. Гвард «чужая задача» и провал
 * инициализации обрывают цепочку на середине: часть фаз не наступит никогда.
 * Молчать в этом случае — худшее, что можно сделать: именно неполный бут и
 * есть диагноз. Уезжает то, что есть, а «до списка дел» не выдумывается —
 * `boot_to_tasks` уходит ТОЛЬКО с реальной фазой `tasks-fetched`. Отсюда же
 * берётся воронка: сколько бутов началось (`phase="init-start"`) против
 * скольких дошло до дел (`phase="tasks-fetched"`), а исход этих дел
 * разложен фазами `tasks-empty` / `tasks-error`.
 *
 * ЗАВИСШИЙ БУТ ОТПРАВЛЯЕТСЯ ТОЖЕ — и это главное. Штатная точка отправки
 * висит на терминальном действии инициализации, но `appInit` умеет встать
 * НАСМЕРТЬ на `Bitrix.start` или на резолве сущностей плейсмента: тогда ни
 * одного действия не диспатчится, и молчали ровно те буты, ради которых
 * замер и заводили («у менеджера ничего не грузится»). Поэтому вместе с
 * `init-start` взводится сторож (см. `armBootMetricsWatchdog`): по таймауту
 * или при уходе со страницы он отправляет то, что успело наступить, тем же
 * однократным путём.
 */

/** Фаза, до которой длится «первая загрузка» в смысле владельца. */
const TASKS_PHASE = 'tasks-fetched';

/**
 * Сколько ждём штатного отчёта, прежде чем отправить, что есть.
 *
 * 25 с — заведомо больше любого живого бута (верхняя корзина гистограммы —
 * 45 с) и заведомо меньше терпения менеджера: к этому моменту он уже либо
 * жмёт ⟳, либо закрывает вкладку, и замер надо успеть отдать.
 */
export const BOOT_WATCHDOG_MS = 25_000;

/** Одно наблюдение: фаза и время от начала загрузки документа, СЕКУНДЫ. */
export interface BootObservation {
    phase: string;
    seconds: number;
}

/**
 * Сводка фаз → наблюдения метрик. Чистая: ни сети, ни глобалей — поэтому
 * ровно она и покрыта тестом, а не отправка целиком.
 *
 * Берётся `fromStartMs` («сколько прошло от начала»), а не `stepMs`
 * («сколько стоила фаза»): на графике нужен ответ «через сколько секунд
 * менеджер увидел X», а стоимость фазы читается разностью соседних
 * квантилей.
 *
 * Синтетическая `document-start` в метрики не уходит: её наблюдение по
 * определению ноль, серию она бы завела впустую. Знаменателем воронки
 * остаётся `init-start` — он наступает в каждом буте, а его значение теперь
 * несёт цену загрузки документа.
 */
export const buildBootObservations = (
    rows: readonly BootPhaseRow[],
): BootObservation[] =>
    rows
        .filter(row => row.phase !== DOCUMENT_START_PHASE)
        .map(row => ({ phase: row.phase, seconds: row.fromStartMs / 1000 }));

/** Отчёт уже уехал в этой загрузке документа. */
let reported = false;

/** Взведённый сторож: таймер и снятие подписки на уход со страницы. */
let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
let watchdogUnsubscribe: (() => void) | null = null;
let watchdogDomain: (() => string | null | undefined) | null = null;

/** Снять сторож. Идемпотентно: зовётся и при штатном отчёте, и при ⟳. */
const disarmBootWatchdog = (): void => {
    if (watchdogTimer !== null) {
        clearTimeout(watchdogTimer);
        watchdogTimer = null;
    }
    if (watchdogUnsubscribe) {
        try {
            watchdogUnsubscribe();
        } catch {
            // Снятие подписки не имеет права ничего уронить.
        }
        watchdogUnsubscribe = null;
    }
    watchdogDomain = null;
};

/** Сброс однократности — только для тестов. */
export const resetBootMetricsForTests = (): void => {
    reported = false;
    disarmBootWatchdog();
    resetBootPhasesForTests();
};

const fireBootWatchdog = (): void => {
    let domain: string | null | undefined;
    try {
        domain = watchdogDomain?.();
    } catch {
        // Стор ещё не собран — домен просто неизвестен, отчёт важнее.
        domain = null;
    }
    disarmBootWatchdog();
    reportBootMetrics(domain);
};

/**
 * Взвести сторож отчёта. Зовётся в начале бута (`appInit`, сразу за меткой
 * `init-start`) — до всех `await`, на которых бут и умеет виснуть.
 *
 * `getDomain` читается ЛЕНИВО, в момент срабатывания: на старте домена ещё
 * нет, а к 25-й секунде он обычно уже известен, и отчёт уедет с разрезом по
 * порталу.
 *
 * Повторный вызов (⟳) перевзводит сторож: прошлый бут отсчитывать больше
 * незачем — сводка всё равно читается окном последнего.
 */
export const armBootMetricsWatchdog = (
    getDomain: () => string | null | undefined,
): void => {
    disarmBootWatchdog();
    if (reported) return;

    watchdogDomain = getDomain;

    try {
        watchdogTimer = setTimeout(fireBootWatchdog, BOOT_WATCHDOG_MS);
        // Тесты и серверные прогоны не должны ждать сторожа: незакрытый
        // таймер держал бы процесс живым 25 секунд впустую.
        (watchdogTimer as unknown as { unref?: () => void }).unref?.();
    } catch {
        watchdogTimer = null;
    }

    // Уход со страницы: `pagehide` переживает и bfcache, и закрытие вкладки,
    // в отличие от `unload`. Зависший бут иначе не отдал бы ничего вовсе.
    if (typeof window === 'undefined') return;
    const handler = () => fireBootWatchdog();
    try {
        window.addEventListener('pagehide', handler);
        watchdogUnsubscribe = () =>
            window.removeEventListener('pagehide', handler);
    } catch {
        watchdogUnsubscribe = null;
    }
};

/**
 * Отправить фазы первой загрузки. Повторный вызов (⟳, второй провал
 * инициализации, сработавший сторож после штатного отчёта) не делает
 * ничего — см. шапку файла.
 *
 * Пустая сводка (нет `performance`, SSR-проход) однократность НЕ сжигает:
 * отправлять было нечего, и первая настоящая загрузка своё право не теряет.
 */
export const reportBootMetrics = (domain?: string | null): void => {
    if (reported) return;

    const observations = buildBootObservations(readBootPhases());
    if (!observations.length) return;

    reported = true;
    disarmBootWatchdog();

    for (const observation of observations) {
        observeBootPhase({
            phase: observation.phase,
            seconds: observation.seconds,
            domain,
        });
    }

    const tasks = observations.find(item => item.phase === TASKS_PHASE);
    if (tasks) observeBootToTasks({ seconds: tasks.seconds, domain });
};
