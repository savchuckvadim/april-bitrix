/**
 * Замеры фаз первой загрузки.
 *
 * До этого файла замеров у бута не было вовсе: «долго грузится» нельзя было
 * разложить на «где именно». Метки ставятся в ключевых точках инициализации
 * (см. app-init.util.ts), сводка печатается диагностикой рядом со снимком
 * состояния (app-diagnostics-listener) — там же, где её будут искать.
 *
 * Формат: performance.mark с префиксом, чтобы не толкаться с чужими метками
 * и чтобы фазы были видны и в DevTools → Performance.
 *
 * ОТКУДА ОТСЧЁТ. Владелец спрашивает «сколько идёт первая загрузка», и для
 * менеджера она начинается в момент, когда фрейм открылся, а не когда
 * отработала гидрация Next и клиентский эффект наконец позвал `appInit`.
 * TTFB, скачивание и разбор бандла во фрейме — обычно БОЛЬШАЯ часть
 * ожидания, и раньше она вычиталась ровно и намеренно: отсчёт шёл от первой
 * метки бута, то есть от `init-start`. Теперь первая загрузка отсчитывается
 * от `timeOrigin` документа — `performance.mark().startTime` и так отсчитан
 * от него, данные были всегда, их просто выбрасывали. Синтетическая фаза
 * `document-start` (ноль) стоит в сводке началом таймлайна, а шаг до
 * `init-start` — это и есть цена загрузки бандла и гидрации.
 *
 * ПЕРЕЗАГРУЗКА ПО ⟳ — ОТДЕЛЬНЫЙ БУТ. Метки не стираются (на них держатся
 * сводка в консоли и вкладка DevTools → Performance), поэтому сводка
 * читается ОКНОМ: от ПОСЛЕДНЕЙ метки `init-start` и дальше. Иначе бут после
 * ⟳ склеивался бы с прерванным первым и показывал сумму двух ожиданий вместо
 * своего собственного. У повторного бута загрузки документа не было —
 * `document-start` в нём не появляется, и отсчёт идёт от его `init-start`.
 */

const PREFIX = 'ev-boot:';

/**
 * Известные фазы — единый реестр. Порядок в списке — ОЖИДАЕМЫЙ на тёплом
 * старте, но сводка печатается в фактической хронологии: независимые цепочки
 * (портал, настройки) стартуют сразу после Bitrix.start, и их финиш честно
 * плавает вокруг резолва сущностей — навязанный порядок дал бы
 * отрицательные шаги.
 *
 * Список обязан совпадать с `BOOT_PHASE_VALUES` контракта метрик — иначе
 * фаза уедет в `other` и на графике её не будет; расхождение ловит тайпчек
 * (metric-contract.test.ts).
 */
export type BootPhase =
    | 'init-start'
    | 'bitrix-started'
    /** Слепок портала в сторе (setPortal): из кэша — мгновенно, из сети — хвост. */
    | 'portal-fetched'
    | 'entities-resolved'
    | 'splash-off'
    | 'app-config-done'
    /**
     * Список дел ДОШЁЛ ДО ТЕРМИНАЛЬНОГО СОСТОЯНИЯ — во всех ветках, а не
     * только когда дела нашлись. Пока метка стояла в одной ветке «дела есть»,
     * главная цифра владельца молчала на целом классе загрузок (встройка
     * задачи, пустой список, упавший запрос), а воронка «сколько бутов
     * дошло до дел» смешивала «медленно», «нет дел» и «не та встройка».
     */
    | 'tasks-fetched'
    /** ИСХОД: грузить было нечего (пустой список либо нет привязки к CRM). */
    | 'tasks-empty'
    /** ИСХОД: запрос списка упал — менеджер дел не увидел. */
    | 'tasks-error';

/**
 * Синтетическая фаза «начало загрузки документа» (timeOrigin, ноль).
 *
 * Метки под ней нет и быть не может: момент наступил до того, как выполнился
 * хоть один байт нашего кода. В сводке она — начало таймлайна, в метрики не
 * уходит (наблюдение всегда 0, серии на ней не нужны).
 */
export const DOCUMENT_START_PHASE = 'document-start';

/** Фаза, с которой начинается бут: она же граница окна сводки. */
const START_PHASE: BootPhase = 'init-start';

/**
 * Фазы, уже отмеченные в ТЕКУЩЕМ буте.
 *
 * Метка каждой фазы обязана быть ОДНА на бут, иначе count фазы перестаёт
 * равняться числу бутов и гистограмма получает по два наблюдения за одну
 * загрузку. Ловится это не гипотетически: `portal-fetched` висит на
 * `portalActions.setPortal`, а слепок портала диспатчится дважды (ответ и
 * фоновое обновление кэша), список дел точечно перечитывается после flow —
 * оба раза метка вставала повторно.
 */
let markedInBoot = new Set<string>();

/** Сброс однократности фаз — только для тестов. */
export const resetBootPhasesForTests = (): void => {
    markedInBoot = new Set<string>();
};

/**
 * Поставить метку фазы. Вне браузера и при недоступном performance — тишина.
 *
 * Повтор фазы в пределах одного бута игнорируется; `init-start` открывает
 * новый бут и обнуляет счёт (⟳ — законный второй бут, а не дубль).
 */
export const markBootPhase = (phase: BootPhase): void => {
    try {
        if (phase === START_PHASE) {
            markedInBoot = new Set<string>();
        } else if (markedInBoot.has(phase)) {
            return;
        }
        performance.mark(`${PREFIX}${phase}`);
        markedInBoot.add(phase);
    } catch {
        // SSR / урезанные окружения — замеры просто не собираются.
    }
};

export interface BootPhaseRow {
    phase: string;
    /**
     * Мс от начала измеряемого бута. Для ПЕРВОГО бута начало — навигация
     * (timeOrigin), то есть сюда входят TTFB, бандл и гидрация; для бута
     * после ⟳ — его собственный `init-start`.
     */
    fromStartMs: number;
    /** Мс от предыдущей фазы — «сколько стоила» именно она. */
    stepMs: number;
}

/**
 * Снять сводку по меткам. Пустой массив — замеров нет (SSR, старый браузер).
 *
 * Строки идут в фактической хронологии: только так `stepMs` («сколько
 * стоила фаза») неотрицателен и честен — ранние цепочки финишируют в разном
 * порядке относительно резолва сущностей.
 */
export const readBootPhases = (): BootPhaseRow[] => {
    try {
        const marks = performance
            .getEntriesByType('mark')
            .filter(entry => entry.name.startsWith(PREFIX))
            .sort((a, b) => a.startTime - b.startTime);
        if (!marks.length) return [];

        // Окно текущего бута: от ПОСЛЕДНЕГО init-start. Меток без него не
        // бывает, но если реестр вдруг пуст — читаем всё, что есть.
        const startName = `${PREFIX}${START_PHASE}`;
        let startIndex = 0;
        for (let i = marks.length - 1; i >= 0; i -= 1) {
            if (marks[i]!.name === startName) {
                startIndex = i;
                break;
            }
        }

        const isFirstBoot = startIndex === 0;
        const bootMarks = marks.slice(startIndex);
        // Первый бут отсчитывается от навигации — тогда `init-start` честно
        // показывает, сколько до него ехали бандл и гидрация.
        const origin = isFirstBoot ? 0 : bootMarks[0]!.startTime;

        const rows: BootPhaseRow[] = [];
        if (isFirstBoot) {
            rows.push({
                phase: DOCUMENT_START_PHASE,
                fromStartMs: 0,
                stepMs: 0,
            });
        }

        let prev = origin;
        for (const mark of bootMarks) {
            rows.push({
                phase: mark.name.slice(PREFIX.length),
                fromStartMs: Math.round(mark.startTime - origin),
                stepMs: Math.round(mark.startTime - prev),
            });
            prev = mark.startTime;
        }
        return rows;
    } catch {
        return [];
    }
};

/** Строка для консольной сводки: «фаза +Xms (итого Yms)». */
export const formatBootPhases = (rows: BootPhaseRow[]): string =>
    rows.length
        ? rows
              .map(
                  row =>
                      `${row.phase} +${row.stepMs}ms (итого ${row.fromStartMs}ms)`,
              )
              .join(' → ')
        : 'меток нет';
