import { describe, expect, it } from 'vitest';

import {
    OUTBOX_NOTICE_COVERED,
    OUTBOX_NOTICE_KIND,
    OUTBOX_NOTICE_SENDING_TEXT,
    OUTBOX_NOTICE_TONE,
    formatIncompleteText,
    formatTailText,
    formatWaitingText,
    pluralizeReports,
    resolveOutboxNotice,
    waitingVerb,
} from './outbox-notice';

/**
 * Полоска недоставленных отчётов: тексты и выбор состояния. Всё чистое —
 * ни стора, ни хранилища; ровно то, что увидит менеджер в списке событий.
 */

describe('плюрализация', () => {
    it('«1 отчёт», «2 отчёта», «5 отчётов», «21 отчёт»', () => {
        expect(pluralizeReports(1)).toBe('1 отчёт');
        expect(pluralizeReports(2)).toBe('2 отчёта');
        expect(pluralizeReports(5)).toBe('5 отчётов');
        expect(pluralizeReports(11)).toBe('11 отчётов');
        expect(pluralizeReports(12)).toBe('12 отчётов');
        expect(pluralizeReports(21)).toBe('21 отчёт');
        expect(pluralizeReports(34)).toBe('34 отчёта');
    });

    it('«ждёт» — только для настоящего единственного числа', () => {
        expect(waitingVerb(1)).toBe('ждёт');
        expect(waitingVerb(11)).toBe('ждут');
        expect(waitingVerb(21)).toBe('ждёт');
        expect(waitingVerb(2)).toBe('ждут');
    });
});

describe('тексты состояний', () => {
    it('ждут отправки — с обещанием, что уйдут сами', () => {
        expect(formatWaitingText(1)).toBe(
            '1 отчёт ждёт отправки — уйдёт сам, как только сервер ответит.',
        );
        expect(formatWaitingText(3)).toBe(
            '3 отчёта ждут отправки — уйдут сами, как только сервер ответит.',
        );
    });

    it('смесь: про ждущих досылки говорим отдельной фразой, не мешая в счёт', () => {
        expect(formatWaitingText(2, 1)).toBe(
            '2 отчёта ждут отправки — уйдут сами, как только сервер ответит. ' +
                'Ещё 1 отчёт ждёт досылки служебной части.',
        );
    });

    it('ждут досылки — ядро проведено, уедет только служебная часть', () => {
        expect(formatTailText(1)).toBe(
            '1 отчёт ждёт досылки: основная часть проведена, служебная ' +
                '(KPI, движения сделок) уедет сама, как только сервер ответит.',
        );
        expect(formatTailText(5)).toBe(
            '5 отчётов ждут досылки: основная часть проведена, служебная ' +
                '(KPI, движения сделок) уедет сама, как только сервер ответит.',
        );
    });

    it('проведены не полностью — зовём человека и запрещаем повтор', () => {
        expect(formatIncompleteText(1)).toBe(
            '1 отчёт проведён не полностью: сервер был недоступен, и часть ' +
                'изменений применить не удалось. Откройте карточку клиента ' +
                'и сверьте — отправлять заново не нужно.',
        );
        expect(formatIncompleteText(2)).toBe(
            '2 отчёта проведены не полностью: сервер был недоступен, и часть ' +
                'изменений применить не удалось. Откройте карточку клиента ' +
                'и сверьте — отправлять заново не нужно.',
        );
    });

    it('ни одно состояние не тащит наружу внутренний жаргон', () => {
        const texts = [
            OUTBOX_NOTICE_SENDING_TEXT,
            formatWaitingText(2, 1),
            formatTailText(2),
            formatIncompleteText(2),
        ];

        for (const text of texts) {
            expect(text).not.toMatch(
                /конверт|outbox|дренаж|partial|deferred|payload/i,
            );
        }
    });
});

describe('resolveOutboxNotice: выбор состояния', () => {
    const base = {
        count: 0,
        partialCount: 0,
        incompleteCount: 0,
        draining: false,
    };

    it('показывать нечего — полоски нет', () => {
        expect(resolveOutboxNotice(base)).toBeNull();
    });

    it('прогон идёт, а счётчики ещё не сведены — «отправляем сохранённые»', () => {
        expect(resolveOutboxNotice({ ...base, draining: true })).toEqual({
            kind: OUTBOX_NOTICE_KIND.SENDING,
            tone: OUTBOX_NOTICE_TONE.MUTED,
            text: OUTBOX_NOTICE_SENDING_TEXT,
            busy: true,
        });
    });

    it('ждущие важнее «идёт отправка», но живой индикатор остаётся', () => {
        const notice = resolveOutboxNotice({
            ...base,
            count: 2,
            draining: true,
        });

        expect(notice?.kind).toBe(OUTBOX_NOTICE_KIND.WAITING);
        expect(notice?.text).toBe(formatWaitingText(2));
        expect(notice?.busy).toBe(true);
    });

    it('все недоставленные — ждут досылки: состояние «хвост»', () => {
        const notice = resolveOutboxNotice({
            ...base,
            count: 3,
            partialCount: 3,
        });

        expect(notice?.kind).toBe(OUTBOX_NOTICE_KIND.TAIL);
        expect(notice?.tone).toBe(OUTBOX_NOTICE_TONE.MUTED);
        expect(notice?.text).toBe(formatTailText(3));
    });

    it('смесь: «ждут отправки» доминирует, число — только по ним', () => {
        const notice = resolveOutboxNotice({
            ...base,
            count: 3,
            partialCount: 1,
        });

        expect(notice?.kind).toBe(OUTBOX_NOTICE_KIND.WAITING);
        expect(notice?.text).toBe(formatWaitingText(2, 1));
    });

    it('тревожное важнее всего: неполно проведённый перебивает и ждущих, и хвост', () => {
        const notice = resolveOutboxNotice({
            count: 4,
            partialCount: 2,
            incompleteCount: 1,
            draining: true,
        });

        expect(notice?.kind).toBe(OUTBOX_NOTICE_KIND.INCOMPLETE);
        expect(notice?.tone).toBe(OUTBOX_NOTICE_TONE.WARNING);
        expect(notice?.text).toBe(formatIncompleteText(1));
    });

    it('хвост важнее «идёт отправка»', () => {
        const notice = resolveOutboxNotice({
            ...base,
            count: 1,
            partialCount: 1,
            draining: true,
        });

        expect(notice?.kind).toBe(OUTBOX_NOTICE_KIND.TAIL);
    });
});

describe('resolveOutboxNotice: о текущей отправке уже сказал баннер стадии', () => {
    it('единственный летящий конверт — полоска молчит', () => {
        expect(
            resolveOutboxNotice({
                count: 1,
                partialCount: 0,
                incompleteCount: 0,
                draining: false,
                covered: OUTBOX_NOTICE_COVERED.WAITING,
            }),
        ).toBeNull();
    });

    it('остальные конверты полоска всё равно называет', () => {
        const notice = resolveOutboxNotice({
            count: 3,
            partialCount: 0,
            incompleteCount: 0,
            draining: false,
            covered: OUTBOX_NOTICE_COVERED.WAITING,
        });

        expect(notice?.text).toBe(formatWaitingText(2));
    });

    it('баннер сказал про хвост текущей отправки — вычитается хвост', () => {
        expect(
            resolveOutboxNotice({
                count: 1,
                partialCount: 1,
                incompleteCount: 0,
                draining: false,
                covered: OUTBOX_NOTICE_COVERED.TAIL,
            }),
        ).toBeNull();
    });

    it('баннер сказал про неполное проведение — вычитается тревожный счёт', () => {
        const notice = resolveOutboxNotice({
            count: 0,
            partialCount: 0,
            incompleteCount: 2,
            draining: false,
            covered: OUTBOX_NOTICE_COVERED.INCOMPLETE,
        });

        expect(notice?.kind).toBe(OUTBOX_NOTICE_KIND.INCOMPLETE);
        expect(notice?.text).toBe(formatIncompleteText(1));
    });

    it('вычитание не уводит счёт в минус', () => {
        expect(
            resolveOutboxNotice({
                count: 0,
                partialCount: 0,
                incompleteCount: 0,
                draining: false,
                covered: OUTBOX_NOTICE_COVERED.WAITING,
            }),
        ).toBeNull();
    });
});
