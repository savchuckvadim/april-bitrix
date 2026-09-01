/**
 * Тексты и выбор состояния полоски недоставленных отчётов в списке событий.
 *
 * Зачем полоска. Второго сервера пока нет, и отчёт может пролежать в
 * браузере менеджера до его следующего входа. Молчать об этом нельзя:
 * менеджер обязан ВИДЕТЬ, что отчёт не пропал, что система его везёт — и
 * отдельно те редкие случаи, где без человека не обойтись.
 *
 * Модуль чистый: ни Redux, ни хранилища, ни React — только счётчики на
 * входе и готовая строка на выходе (образец — прежний outbox-badge-text).
 * Счётчики приходят из зеркала OutboxSlice, которое наполняют thunk'и
 * outbox по хранилищу; сама полоска ничего не считает и в IndexedDB не
 * ходит.
 *
 * ЧЕСТНОСТЬ — главное правило текстов:
 * - конверт с исполненным ядром (`partial`) отправить ЦЕЛИКОМ нельзя (бэк
 *   прямого исполнения не видел) — про него говорим «ждёт досылки», а не
 *   «ждёт отправки»;
 * - отчёт, проведённый НЕ ЦЕЛИКОМ (`directFailedCommands`), повторить
 *   нечем — ему не обещают ни автоматической отправки, ни кнопки
 *   «Повторить»: единственное честное действие — открыть карточку и
 *   сверить.
 */

/** Что именно сообщает полоска (у каждого состояния свой текст и тон). */
export const OUTBOX_NOTICE_KIND = {
    /** Прогон дренажа идёт прямо сейчас — система работает. */
    SENDING: 'sending',
    /** Конверты лежат в браузере и ждут, пока сервер ответит. */
    WAITING: 'waiting',
    /** Ядро проведено, ждёт досылки служебная часть (partial, А5). */
    TAIL: 'tail',
    /** Отчёт проведён НЕ ЦЕЛИКОМ — нужен человек. */
    INCOMPLETE: 'incomplete',
} as const;
export type OutboxNoticeKind =
    (typeof OUTBOX_NOTICE_KIND)[keyof typeof OUTBOX_NOTICE_KIND];

/**
 * Тон полоски: `muted` — фон, спокойная констатация; `warning` — заметнее,
 * потому что требует действия менеджера.
 */
export const OUTBOX_NOTICE_TONE = {
    MUTED: 'muted',
    WARNING: 'warning',
} as const;
export type OutboxNoticeTone =
    (typeof OUTBOX_NOTICE_TONE)[keyof typeof OUTBOX_NOTICE_TONE];

/**
 * Что о ТЕКУЩЕЙ отправке уже сказал баннер стадии (FlowStatusBanner) прямо
 * над полоской. Её конверт лежит в тех же счётчиках, и без вычитания две
 * строки подряд говорили бы об одном и том же отчёте.
 */
export const OUTBOX_NOTICE_COVERED = {
    /** Баннер молчит — полоска говорит обо всех конвертах. */
    NONE: 'none',
    /** Баннер: «отчёт ещё отправляется» / «сохранён, отправится сам». */
    WAITING: 'waiting',
    /** Баннер: «проведён напрямую, служебная часть доедет сама». */
    TAIL: 'tail',
    /** Баннер: «проведён не полностью — проверьте карточку». */
    INCOMPLETE: 'incomplete',
} as const;
export type OutboxNoticeCovered =
    (typeof OUTBOX_NOTICE_COVERED)[keyof typeof OUTBOX_NOTICE_COVERED];

/** Зеркало outbox глазами полоски. */
export interface OutboxNoticeInput {
    /** Всего недоставленных конвертов домена (isUndeliveredEnvelope). */
    count: number;
    /** Из них `partial`: ядро проведено, хвост ждёт досылки (А5). */
    partialCount: number;
    /** Проведены НЕ ЦЕЛИКОМ (directFailedCommands); в count не входят. */
    incompleteCount: number;
    /** Прогон дренажа идёт прямо сейчас. */
    draining: boolean;
    /** Что уже сказал баннер стадии о текущей отправке. */
    covered?: OutboxNoticeCovered;
}

export interface OutboxNotice {
    kind: OutboxNoticeKind;
    tone: OutboxNoticeTone;
    text: string;
    /** Дренаж работает прямо сейчас — полоске показать живой индикатор. */
    busy: boolean;
}

/**
 * Русская плюрализация отчётов: «1 отчёт», «2 отчёта», «5 отчётов»,
 * «21 отчёт». Экспортируется — на ней стоят все тексты полоски.
 */
export const pluralizeReports = (count: number): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return `${count} отчёт`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} отчёта`;
    }

    return `${count} отчётов`;
};

/** Единственное число по тем же правилам счёта, что и pluralizeReports. */
const isSingular = (count: number): boolean => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    return mod10 === 1 && mod100 !== 11;
};

/** «ждёт» для одного, «ждут» для остальных. */
export const waitingVerb = (count: number): string =>
    isSingular(count) ? 'ждёт' : 'ждут';

/** «уйдёт сам» / «уйдут сами» — обещание автоматической отправки. */
const leavingVerb = (count: number): string =>
    isSingular(count) ? 'уйдёт сам' : 'уйдут сами';

/** «проведён» / «проведены» — о неполно проведённых отчётах. */
const executedVerb = (count: number): string =>
    isSingular(count) ? 'проведён' : 'проведены';

/** Текст «идёт досылка прямо сейчас» — без числа: счётчики ещё не сведены. */
export const OUTBOX_NOTICE_SENDING_TEXT = 'Отправляем сохранённые отчёты…';

/**
 * «N отчётов ждут отправки — уйдут сами, как только сервер ответит».
 * Есть ещё и partial-конверты — добавляем про них отдельную фразу: слать
 * их целиком нельзя, и мешать в одно число было бы враньём.
 */
export const formatWaitingText = (
    waiting: number,
    tail: number = 0,
): string => {
    const head =
        `${pluralizeReports(waiting)} ${waitingVerb(waiting)} отправки — ` +
        `${leavingVerb(waiting)}, как только сервер ответит.`;

    return tail > 0
        ? `${head} Ещё ${pluralizeReports(tail)} ${waitingVerb(tail)} досылки служебной части.`
        : head;
};

/**
 * «N отчётов ждут досылки»: ядро проведено — событие закрыто, карточки
 * обновлены, — а служебная часть уедет на бэк отдельным каналом (А5).
 */
export const formatTailText = (tail: number): string =>
    `${pluralizeReports(tail)} ${waitingVerb(tail)} досылки: основная часть ` +
    `проведена, служебная (KPI, движения сделок) уедет сама, как только ` +
    `сервер ответит.`;

/**
 * «N отчётов проведены не полностью» — единственное тревожное состояние:
 * ни дренаж, ни повтор такой конверт не починят (повторять нечем), поэтому
 * текст зовёт человека и прямо снимает соблазн отправить отчёт заново.
 */
export const formatIncompleteText = (incomplete: number): string =>
    `${pluralizeReports(incomplete)} ${executedVerb(incomplete)} не ` +
    `полностью: сервер был недоступен, и часть изменений применить не ` +
    `удалось. Откройте карточку клиента и сверьте — отправлять заново не ` +
    `нужно.`;

/** Счётчики за вычетом того, о чём уже сказал баннер стадии. */
const withoutCovered = (
    params: OutboxNoticeInput,
): { waiting: number; tail: number; incomplete: number } => {
    const covered = params.covered ?? OUTBOX_NOTICE_COVERED.NONE;
    const drop = (value: number, when: OutboxNoticeCovered): number =>
        Math.max(0, covered === when ? value - 1 : value);
    // Обычные недоставленные = все минус те, что ждут досылки хвоста.
    const plain = Math.max(0, params.count - params.partialCount);

    return {
        waiting: drop(plain, OUTBOX_NOTICE_COVERED.WAITING),
        tail: drop(params.partialCount, OUTBOX_NOTICE_COVERED.TAIL),
        incomplete: drop(
            params.incompleteCount,
            OUTBOX_NOTICE_COVERED.INCOMPLETE,
        ),
    };
};

/**
 * Что показать полоске (null — показывать нечего).
 *
 * Порядок важности, ровно как решил владелец: тревожное важнее ждущего,
 * ждущее важнее «идёт отправка». Поэтому «отправляем сохранённые отчёты…»
 * достаётся ровно тому случаю, ради которого и заведено: прогон уже везёт
 * конверты, а свести счётчики ещё не успел (зеркало публикуется в КОНЦЕ
 * прогона) — самый частый вход менеджера на следующий день. Как только
 * прогон свёл счета, полоска говорит о реальном остатке, а «система
 * работает» остаётся живым индикатором (busy), а не подменой факта.
 *
 * Число называется своё у каждого состояния: «ждут отправки» считает
 * только те конверты, которые действительно можно отправить целиком.
 */
export const resolveOutboxNotice = (
    params: OutboxNoticeInput,
): OutboxNotice | null => {
    const { waiting, tail, incomplete } = withoutCovered(params);
    const busy = params.draining;

    if (incomplete > 0) {
        return {
            kind: OUTBOX_NOTICE_KIND.INCOMPLETE,
            tone: OUTBOX_NOTICE_TONE.WARNING,
            text: formatIncompleteText(incomplete),
            busy,
        };
    }
    if (waiting > 0) {
        return {
            kind: OUTBOX_NOTICE_KIND.WAITING,
            tone: OUTBOX_NOTICE_TONE.MUTED,
            text: formatWaitingText(waiting, tail),
            busy,
        };
    }
    if (tail > 0) {
        return {
            kind: OUTBOX_NOTICE_KIND.TAIL,
            tone: OUTBOX_NOTICE_TONE.MUTED,
            text: formatTailText(tail),
            busy,
        };
    }
    if (busy) {
        return {
            kind: OUTBOX_NOTICE_KIND.SENDING,
            tone: OUTBOX_NOTICE_TONE.MUTED,
            text: OUTBOX_NOTICE_SENDING_TEXT,
            busy,
        };
    }

    return null;
};
