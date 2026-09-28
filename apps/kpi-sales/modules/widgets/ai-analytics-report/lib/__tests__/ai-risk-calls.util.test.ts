import { describe, expect, it } from 'vitest';
import type { AiRiskCall } from '@/modules/entities/ai-analytics/model';
import { aiCardLink } from '../ai-card-link.util';
import {
    AI_RISK_CALL_NO_LINK_TEXT,
    AI_RISK_CALLS_COLLAPSE_LABEL,
    aiRiskCallLink,
    aiRiskCallNoLinkText,
    aiRiskCallsToggleLabel,
    buildAiRiskCallsView,
} from '../ai-risk-calls.util';

const CARD_LINK = 'https://april.bitrix24.ru/crm/type/1036/details/128/';

const riskCall = (overrides: Partial<AiRiskCall> = {}): AiRiskCall => ({
    transcriptionId: 't-1',
    kind: 'promise',
    callStartedAt: '2026-09-10T10:00:00Z',
    link: null,
    ...overrides,
});

/** Пять звонков: t-1 самый старый, t-5 самый свежий. */
const fiveCalls = (): AiRiskCall[] =>
    [1, 2, 3, 4, 5].map(day =>
        riskCall({
            transcriptionId: `t-${day}`,
            callStartedAt: `2026-09-0${day}T10:00:00Z`,
        }),
    );

describe('ai-card-link.util — адрес карточки разбора', () => {
    it('адрес страницы — ссылка; пробелы по краям срезаются', () => {
        expect(aiCardLink(CARD_LINK)).toBe(CARD_LINK);
        expect(aiCardLink(`  ${CARD_LINK} `)).toBe(CARD_LINK);
        expect(aiCardLink('http://portal.local/crm/type/1/details/2/')).toBe(
            'http://portal.local/crm/type/1/details/2/',
        );
        expect(aiCardLink('HTTPS://APRIL.BITRIX24.RU/crm/')).toBe(
            'HTTPS://APRIL.BITRIX24.RU/crm/',
        );
    });

    it('пусто, не строка, не адрес страницы — ссылки нет', () => {
        expect(aiCardLink(null)).toBeNull();
        expect(aiCardLink(undefined)).toBeNull();
        expect(aiCardLink('')).toBeNull();
        expect(aiCardLink('   ')).toBeNull();
        expect(aiCardLink(128)).toBeNull();
        expect(aiCardLink({ href: CARD_LINK })).toBeNull();
        expect(aiCardLink('javascript:alert(1)')).toBeNull();
        expect(aiCardLink('crm/type/1036/details/128/')).toBeNull();
    });
});

describe('ai-risk-calls.util — ссылка на разбор', () => {
    it('ссылка строкой — отдаём её', () => {
        expect(aiRiskCallLink(riskCall({ link: CARD_LINK }))).toBe(CARD_LINK);
    });

    it('null — карточки разбора ещё нет', () => {
        expect(aiRiskCallLink(riskCall())).toBeNull();
        expect(aiRiskCallLink(riskCall({ link: '' }))).toBeNull();
    });

    it('обзор, сохранённый до появления ссылок (поля нет), — ссылки нет', () => {
        const cached: Partial<AiRiskCall> = {
            transcriptionId: 't-1',
            kind: 'promise',
            callStartedAt: '2026-09-10T10:00:00Z',
        };
        expect(aiRiskCallLink(cached)).toBeNull();
        expect(aiRiskCallLink({ link: undefined })).toBeNull();
    });
});

describe('ai-risk-calls.util — подпись на месте ссылки', () => {
    it('сервер ответил, что карточки нет, — «разбор ещё не создан»', () => {
        expect(AI_RISK_CALL_NO_LINK_TEXT).toBe('разбор ещё не создан');
        expect(aiRiskCallNoLinkText(riskCall())).toBe(
            AI_RISK_CALL_NO_LINK_TEXT,
        );
        expect(aiRiskCallNoLinkText(riskCall({ link: '  ' }))).toBe(
            AI_RISK_CALL_NO_LINK_TEXT,
        );
    });

    it('ссылка есть — подписи нет', () => {
        expect(aiRiskCallNoLinkText(riskCall({ link: CARD_LINK }))).toBeNull();
    });

    it('обзор, сохранённый до появления ссылок (поля нет), — про разбор ничего не утверждаем', () => {
        const cached: Partial<AiRiskCall> = {
            transcriptionId: 't-1',
            kind: 'promise',
            callStartedAt: '2026-09-10T10:00:00Z',
        };
        expect(aiRiskCallNoLinkText(cached)).toBeNull();
        expect(aiRiskCallNoLinkText({ link: undefined })).toBeNull();
    });

    it('пришёл не адрес страницы — ни ссылки, ни подписи', () => {
        const call = riskCall({ link: 'crm/type/1036/details/128/' });
        expect(aiRiskCallLink(call)).toBeNull();
        expect(aiRiskCallNoLinkText(call)).toBeNull();
    });
});

describe('ai-risk-calls.util — список «первые три — ещё N»', () => {
    it('свёрнуто: три самых свежих, остальные спрятаны', () => {
        const view = buildAiRiskCallsView(fiveCalls(), false);
        expect(view.rows.map(call => call.transcriptionId)).toEqual([
            't-5',
            't-4',
            't-3',
        ]);
        expect(view.hidden).toBe(2);
        expect(view.canToggle).toBe(true);
        expect(aiRiskCallsToggleLabel(view, false)).toBe('ещё 2');
    });

    it('развёрнуто: все звонки, свежие первыми; подпись — «свернуть»', () => {
        const view = buildAiRiskCallsView(fiveCalls(), true);
        expect(view.rows.map(call => call.transcriptionId)).toEqual([
            't-5',
            't-4',
            't-3',
            't-2',
            't-1',
        ]);
        expect(view.hidden).toBe(0);
        expect(view.canToggle).toBe(true);
        expect(aiRiskCallsToggleLabel(view, true)).toBe(
            AI_RISK_CALLS_COLLAPSE_LABEL,
        );
    });

    it('три звонка и меньше — переключателя нет', () => {
        const view = buildAiRiskCallsView(fiveCalls().slice(0, 3), false);
        expect(view.rows).toHaveLength(3);
        expect(view.hidden).toBe(0);
        expect(view.canToggle).toBe(false);
    });

    it('звонков нет (пустой список, null, поля нет) — пустой вид', () => {
        const empty = { rows: [], hidden: 0, canToggle: false };
        expect(buildAiRiskCallsView([], false)).toEqual(empty);
        expect(buildAiRiskCallsView(null, false)).toEqual(empty);
        expect(buildAiRiskCallsView(undefined, true)).toEqual(empty);
    });

    it('исходный список не меняется', () => {
        const calls = fiveCalls();
        buildAiRiskCallsView(calls, true);
        expect(calls.map(call => call.transcriptionId)).toEqual([
            't-1',
            't-2',
            't-3',
            't-4',
            't-5',
        ]);
    });
});
