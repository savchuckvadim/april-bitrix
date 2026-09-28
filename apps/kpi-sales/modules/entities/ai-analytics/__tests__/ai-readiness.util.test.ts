import { describe, expect, it } from 'vitest';
import {
    AI_BETA_COUNTDOWN_REACHED,
    AI_READINESS_REASON_LABELS,
    AI_READINESS_REASON_UNKNOWN,
    formatAiReadinessReason,
    formatAiReadinessReasons,
    formatBetaCountdown,
    formatUnknownAiReadinessReason,
    pluralRu,
} from '../lib/ai-readiness.data';
import {
    AI_ERROR_FORBIDDEN_TEXT,
    AI_ERROR_GENERIC_TEXT,
    aiErrorMessage,
    aiErrorStatus,
    aiServerMessage,
    aiUserErrorText,
    isAiTechnicalErrorText,
} from '../lib/ai-error.util';
import { httpError } from './ai-fixtures';

describe('formatAiReadinessReason — подписи кодов причин', () => {
    it('коды без гейта — из таблицы', () => {
        expect(formatAiReadinessReason('calendar-not-imported')).toBe(
            AI_READINESS_REASON_LABELS['calendar-not-imported'],
        );
        expect(formatAiReadinessReason('no-portal-model')).toContain('Модели');
        expect(
            formatAiReadinessReason('data-quality-timestamp-leak'),
        ).toContain('Качество данных');
        expect(
            formatAiReadinessReason('no-analysis-in-pipeline-window'),
        ).toContain('Разборов');
        expect(formatAiReadinessReason('roster-not-confirmed')).toContain(
            'не подтверждены',
        );
        expect(formatAiReadinessReason('hypothesis-not-set')).toContain(
            'Гипотеза',
        );
    });

    it('коды с гейтом подставляют число', () => {
        expect(formatAiReadinessReason('history-months-below-3')).toBe(
            'Истории меньше 3 месяцев',
        );
        expect(formatAiReadinessReason('history-months-below-1')).toBe(
            'Истории меньше 1 месяца',
        );
        expect(formatAiReadinessReason('presentations-below-60')).toBe(
            'Разобранных презентаций меньше 60',
        );
        expect(formatAiReadinessReason('norms-presentations-below-100')).toBe(
            'Для норм нужно не меньше 100 презентаций',
        );
    });

    it('неизвестный код — нейтральная подпись без самого кода', () => {
        expect(formatAiReadinessReason('something-new-7')).toBe(
            formatUnknownAiReadinessReason(),
        );
        expect(formatAiReadinessReason('weird')).toBe(
            AI_READINESS_REASON_UNKNOWN,
        );
        expect(formatAiReadinessReason('weird')).not.toContain('weird');
        expect(AI_READINESS_REASON_UNKNOWN).toContain('разработчика');
    });

    it('список причин: порядок бэка, дубли схлопнуты, undefined — пусто', () => {
        expect(
            formatAiReadinessReasons([
                'no-portal-model',
                'presentations-below-60',
                'no-portal-model',
            ]),
        ).toEqual([
            AI_READINESS_REASON_LABELS['no-portal-model'],
            'Разобранных презентаций меньше 60',
        ]);
        expect(formatAiReadinessReasons(undefined)).toEqual([]);
    });
});

describe('pluralRu', () => {
    it('склоняет по правилам русского языка', () => {
        const forms = ['месяц', 'месяца', 'месяцев'] as const;
        expect(pluralRu(1, forms)).toBe('месяц');
        expect(pluralRu(2, forms)).toBe('месяца');
        expect(pluralRu(5, forms)).toBe('месяцев');
        expect(pluralRu(11, forms)).toBe('месяцев');
        expect(pluralRu(21, forms)).toBe('месяц');
        expect(pluralRu(22, forms)).toBe('месяца');
        expect(pluralRu(112, forms)).toBe('месяцев');
    });
});

describe('formatBetaCountdown — счётчик «до оценки связи „качество → продажи“»', () => {
    it('null/undefined — счётчика нет', () => {
        expect(formatBetaCountdown(null)).toBeNull();
        expect(formatBetaCountdown(undefined)).toBeNull();
    });

    it('презентации и месяцы при известном темпе', () => {
        expect(
            formatBetaCountdown({
                seNow: 0.4,
                presentationsLeft: 40,
                monthsLeft: 2.4,
            }),
        ).toBe(
            'до оценки связи «качество → продажи» осталось ≈ 40 презентаций / 2 месяца',
        );
        expect(
            formatBetaCountdown({
                seNow: null,
                presentationsLeft: 1,
                monthsLeft: 0.2,
            }),
        ).toBe(
            'до оценки связи «качество → продажи» осталось ≈ 1 презентация / 1 месяц',
        );
    });

    it('темп неизвестен — только презентации', () => {
        expect(
            formatBetaCountdown({
                seNow: null,
                presentationsLeft: 23,
                monthsLeft: null,
            }),
        ).toBe('до оценки связи «качество → продажи» осталось ≈ 23 презентации');
    });

    it('объём набран — отдельная подпись без греческих символов', () => {
        expect(
            formatBetaCountdown({
                seNow: 0.1,
                presentationsLeft: 0,
                monthsLeft: 0,
            }),
        ).toBe(AI_BETA_COUNTDOWN_REACHED);
        expect(AI_BETA_COUNTDOWN_REACHED).not.toContain('β');
    });
});

describe('isAiTechnicalErrorText / aiUserErrorText — служебный текст не показываем', () => {
    it('латиница без русского и маркеры axios — служебные', () => {
        expect(isAiTechnicalErrorText('Request failed with status code 403')).toBe(
            true,
        );
        expect(isAiTechnicalErrorText('Network Error')).toBe(true);
        expect(isAiTechnicalErrorText('План дня выключен на портале')).toBe(
            false,
        );
    });

    it('текст из стора: понятный — как есть, служебный или пустой — запасной', () => {
        expect(aiUserErrorText('Доступ закрыт')).toBe('Доступ закрыт');
        expect(aiUserErrorText('Network Error')).toBe(AI_ERROR_GENERIC_TEXT);
        expect(aiUserErrorText('', 'запас')).toBe('запас');
        expect(aiUserErrorText(null, 'запас')).toBe('запас');
    });
});

describe('aiErrorMessage — текст сервера из HTTP-ошибки', () => {
    it('403/400 axios: message из тела ответа, статус — из response', () => {
        const error = httpError(403, 'План дня выключен на портале');
        expect(aiServerMessage(error)).toBe('План дня выключен на портале');
        expect(aiErrorStatus(error)).toBe(403);
        expect(aiErrorMessage(error, 'запас')).toBe(
            'План дня выключен на портале',
        );
    });

    it('массив сообщений валидации склеивается', () => {
        const error = Object.assign(new Error('400'), {
            response: {
                status: 400,
                data: { message: ['agree обязателен', 'ropScore ≤ 10'] },
            },
        });
        expect(aiErrorMessage(error, 'запас')).toBe(
            'agree обязателен; ropScore ≤ 10',
        );
    });

    it('служебный текст axios не показываем: 403 без текста — «доступ закрыт», иначе запасной', () => {
        const forbidden = Object.assign(
            new Error('Request failed with status code 403'),
            { response: { status: 403, data: {} } },
        );
        expect(aiErrorMessage(forbidden, 'запас')).toBe(
            AI_ERROR_FORBIDDEN_TEXT,
        );
        const server = Object.assign(new Error('Network Error'), {
            response: { status: 500, data: {} },
        });
        expect(aiErrorMessage(server, 'запас')).toBe('запас');
        expect(aiErrorMessage(new Error('Network Error'), 'запас')).toBe(
            'запас',
        );
    });

    it('обычная ошибка — её message; пустая/не ошибка — запасной текст', () => {
        expect(aiErrorMessage(new Error('Сеть'), 'запас')).toBe('Сеть');
        expect(aiErrorMessage(new Error(''), 'запас')).toBe('запас');
        expect(aiErrorMessage('строка', 'запас')).toBe('запас');
        expect(aiErrorStatus(new Error('x'))).toBeNull();
        expect(aiServerMessage({ response: { data: { message: '' } } })).toBe(
            null,
        );
    });
});
