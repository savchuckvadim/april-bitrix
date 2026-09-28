import { describe, expect, it } from 'vitest';
import {
    AI_DAILY_PLAN_DISABLED_MESSAGE,
    AI_ERROR_FORBIDDEN_TEXT,
    AI_QUEUED_ERROR_MESSAGES,
} from '@/modules/entities/ai-analytics';
import {
    AI_SECTION_ERROR_HINTS,
    aiSectionErrorHint,
    detectAiSectionErrorKind,
    isAiSectionAccessError,
} from '../lib/ai-section-error.util';

/** Тексты 403 бэка (requester-access.service, ai-analytics.const, ai-plan.const) — прежние и новые. */
const SELF_VIEW_403 =
    'Витрина AI-аналитики доступна руководителям; включите ai_analytics_self_view_enabled, чтобы менеджеры видели свои данные';
const SELF_VIEW_403_NEW =
    'Витрина AI-аналитики открыта руководителям — попросите разработчика включить настройку «Менеджер видит свою аналитику»';
const DAILY_PLAN_403 =
    'План дня выключен на портале: включите признак «План дня в утреннем дайджесте и ручке plan/daily» (ai_analytics_daily_plan_enabled) в настройках приложения kpi-sales портала';
const DAILY_PLAN_403_NEW =
    'План дня выключен на портале: попросите разработчика включить «План дня» в настройках AI-аналитики';
const SCOPE_403 = 'Менеджер вне периметра видимости пользователя';
const LEADER_403 = 'Операция доступна только руководителю отдела продаж';
const AXIOS_403 = 'Request failed with status code 403';

describe('detectAiSectionErrorKind — типовые ошибки по тексту сервера', () => {
    it('витрина только руководителям — прежний и новый текст бэка', () => {
        expect(detectAiSectionErrorKind(SELF_VIEW_403)).toBe('selfView');
        expect(detectAiSectionErrorKind(SELF_VIEW_403_NEW)).toBe('selfView');
    });

    it('раздел выключен настройкой портала — тексты бэка и гейт фронта', () => {
        expect(detectAiSectionErrorKind(DAILY_PLAN_403)).toBe('disabled');
        expect(detectAiSectionErrorKind(DAILY_PLAN_403_NEW)).toBe('disabled');
        expect(detectAiSectionErrorKind(AI_DAILY_PLAN_DISABLED_MESSAGE)).toBe(
            'disabled',
        );
    });

    it('запасной текст фронта для 403 без текста сервера — отказ в доступе', () => {
        expect(detectAiSectionErrorKind(AI_ERROR_FORBIDDEN_TEXT)).toBe(
            'forbidden',
        );
    });

    it('периметр и «только руководителю»', () => {
        expect(detectAiSectionErrorKind(SCOPE_403)).toBe('scope');
        expect(detectAiSectionErrorKind(LEADER_403)).toBe('leaderOnly');
    });

    it('403 без текста сервера — по коду axios', () => {
        expect(detectAiSectionErrorKind(AXIOS_403)).toBe('forbidden');
        expect(detectAiSectionErrorKind('Forbidden')).toBe('forbidden');
    });

    it('остальные ошибки — не типовые', () => {
        expect(
            detectAiSectionErrorKind('Request failed with status code 500'),
        ).toBeNull();
        expect(
            detectAiSectionErrorKind(AI_QUEUED_ERROR_MESSAGES.overview),
        ).toBeNull();
        expect(detectAiSectionErrorKind('Network Error')).toBeNull();
        expect(detectAiSectionErrorKind(null)).toBeNull();
        expect(detectAiSectionErrorKind('')).toBeNull();
    });
});

describe('aiSectionErrorHint / isAiSectionAccessError', () => {
    it('подсказка соответствует виду; без вида — null', () => {
        expect(aiSectionErrorHint(SELF_VIEW_403)).toBe(
            AI_SECTION_ERROR_HINTS.selfView,
        );
        expect(aiSectionErrorHint(DAILY_PLAN_403)).toBe(
            AI_SECTION_ERROR_HINTS.disabled,
        );
        expect(aiSectionErrorHint(AXIOS_403)).toBe(
            AI_SECTION_ERROR_HINTS.forbidden,
        );
        expect(aiSectionErrorHint('Что-то пошло не так')).toBeNull();
    });

    it('ошибка доступа/настройки — повтор без изменений не поможет', () => {
        expect(isAiSectionAccessError(SELF_VIEW_403)).toBe(true);
        expect(isAiSectionAccessError('Timeout')).toBe(false);
    });

    it('подсказки без ключей настроек, кодов ответа и «админки»', () => {
        for (const hint of Object.values(AI_SECTION_ERROR_HINTS)) {
            expect(hint).not.toMatch(/ai_analytics_|403|kpi-sales|админ/i);
        }
    });
});
