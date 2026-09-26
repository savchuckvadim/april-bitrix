import { describe, expect, it } from 'vitest';
import {
    AI_FEEDBACK_OBJECT_OTHER,
    aiFeedbackChannel,
    aiFeedbackKey,
    aiFeedbackObjectLabel,
    aiFeedbackView,
    formatAiFeedbackError,
} from '../lib/ai-feedback.util';
import {
    AI_DOSSIER_FEEDBACK_OTHER,
    aiDossierFeedbackParts,
    formatAiDossierFeedback,
} from '../lib/ai-dossier.util';

describe('ai-feedback.util — каналы и ключи', () => {
    it('«полезно / не полезно» — один канал, остальные виды — свои', () => {
        expect(aiFeedbackChannel('useful')).toBe('rate');
        expect(aiFeedbackChannel('not_useful')).toBe('rate');
        expect(aiFeedbackChannel('rate')).toBe('rate');
        expect(aiFeedbackChannel('view')).toBe('view');
        expect(aiFeedbackChannel('disagree')).toBe('disagree');
        expect(aiFeedbackChannel('alert_handled')).toBe('alert_handled');
    });

    it('ключ = канал + объект: view и «пальцы» по pulse не совпадают', () => {
        expect(aiFeedbackKey('useful', 'pulse')).toBe(
            aiFeedbackKey('not_useful', 'pulse'),
        );
        expect(aiFeedbackKey('view', 'pulse')).not.toBe(
            aiFeedbackKey('useful', 'pulse'),
        );
        expect(aiFeedbackKey('alert_handled', 'call:t-1')).not.toBe(
            aiFeedbackKey('useful', 'call:t-1'),
        );
        // Объект с двоеточиями не ломает ключ.
        expect(aiFeedbackKey('disagree', 'attention:7:quality')).toBe(
            'disagree|attention:7:quality',
        );
    });
});

describe('ai-feedback.util — ошибка и состояние кнопок', () => {
    it('ошибка: «Не сохранилось: <текст>», пустая — null', () => {
        expect(formatAiFeedbackError('Нет доступа')).toBe(
            'Не сохранилось: Нет доступа',
        );
        expect(formatAiFeedbackError('  ')).toBeNull();
        expect(formatAiFeedbackError(null)).toBeNull();
        expect(formatAiFeedbackError(undefined)).toBeNull();
    });

    it('состояние канала: подсветка, pending, ошибка — только по своему ключу', () => {
        const rateKey = aiFeedbackKey('rate', 'agenda');
        const store = {
            pending: [aiFeedbackKey('view', 'agenda')],
            sent: { [rateKey]: 'not_useful' as const },
            errors: { [rateKey]: 'Сеть недоступна' },
        };
        expect(aiFeedbackView(store, 'rate', 'agenda', false)).toEqual({
            sent: 'not_useful',
            pending: false,
            disabled: false,
            readOnlyHint: null,
            error: 'Не сохранилось: Сеть недоступна',
        });
        const handled = aiFeedbackView(store, 'alert_handled', 'agenda', false);
        expect(handled.sent).toBeNull();
        expect(handled.error).toBeNull();
    });
});

describe('ai-feedback.util — объект реакции по-человечески', () => {
    it('коды несогласий повестки → текст без сырых кодов', () => {
        expect(aiFeedbackObjectLabel('overview:512')).toBe('строка обзора');
        expect(aiFeedbackObjectLabel('site-review:128')).toBe(
            'отзыв с сайта по разбору',
        );
        expect(aiFeedbackObjectLabel('call:9001')).toBe('звонок #9001');
        expect(aiFeedbackObjectLabel('attention:7:quality')).toBe(
            'сигнал «Внимания»',
        );
        expect(aiFeedbackObjectLabel('pulse')).toBe('пульс дисциплины');
        expect(aiFeedbackObjectLabel('agenda')).toBe('повестка планёрки');
        expect(aiFeedbackObjectLabel('overview')).toBe('обзор');
    });

    it('неизвестный объект — общая подпись, не код', () => {
        expect(aiFeedbackObjectLabel('mystery:42')).toBe(
            AI_FEEDBACK_OBJECT_OTHER,
        );
        expect(aiFeedbackObjectLabel('')).toBe(AI_FEEDBACK_OBJECT_OTHER);
    });
});

describe('ai-dossier.util — свод «Обратная связь»', () => {
    it('известные виды по-русски в порядке справочника', () => {
        expect(
            aiDossierFeedbackParts({
                disagree: 1,
                alert_handled: 2,
                useful: 4,
                not_useful: 3,
            }),
        ).toEqual([
            'полезно 4',
            'не полезно 3',
            'не согласен 1',
            'отработано 2',
        ]);
    });

    it('неизвестные виды складываются в одно «прочее N», нули и мусор пропускаем', () => {
        expect(
            aiDossierFeedbackParts({
                useful: 2,
                rop_mark: 3,
                digest_sent: 1,
                disagree: 0,
                broken: 'x',
            }),
        ).toEqual(['полезно 2', `${AI_DOSSIER_FEEDBACK_OTHER} 4`]);
    });

    it('строка свода: итог и части; пусто — «реакций пока нет»', () => {
        expect(
            formatAiDossierFeedback({
                total: 7,
                byKind: { useful: 4, disagree: 1, custom: 2 },
            }),
        ).toBe('реакций 7: полезно 4, не согласен 1, прочее 2');
        expect(formatAiDossierFeedback({ total: 3, byKind: {} })).toBe(
            'реакций 3',
        );
        expect(formatAiDossierFeedback({ total: 0, byKind: {} })).toBe(
            'реакций пока нет',
        );
    });
});
