import { describe, expect, it } from 'vitest';
import {
    UI_SETTINGS_EXTRA_BADGES_MAX,
    UI_SETTINGS_EXTRA_BADGE_ID_MAX,
    sanitizeExtraBadges,
} from '../lib/ui-settings-calls-list';
import type { UiSettingsBlob } from '../lib/ui-settings.types';
import { uiSettingsActions, uiSettingsReducer } from '../model/ui-settings-slice';

const initial = () => uiSettingsReducer(undefined, { type: 'init' });

describe('sanitizeExtraBadges — добавленные бейджи из блоба', () => {
    it('не список — пусто', () => {
        expect(sanitizeExtraBadges(undefined)).toEqual([]);
        expect(sanitizeExtraBadges(null)).toEqual([]);
        expect(sanitizeExtraBadges('no_price')).toEqual([]);
        expect(sanitizeExtraBadges({ 0: 'no_price' })).toEqual([]);
    });

    it('остаются только непустые строки, без повторов, порядок сохраняется', () => {
        expect(
            sanitizeExtraBadges(['no_price', '', 5, null, 'm:greeting', 'no_price', {}, 'second_call']),
        ).toEqual(['no_price', 'm:greeting', 'second_call']);
    });

    it('слишком длинный id отбрасывается', () => {
        const tooLong = 'a'.repeat(UI_SETTINGS_EXTRA_BADGE_ID_MAX + 1);
        const fits = 'a'.repeat(UI_SETTINGS_EXTRA_BADGE_ID_MAX);
        expect(sanitizeExtraBadges([tooLong, fits])).toEqual([fits]);
    });

    it('не больше сорока: лишние отбрасываются с конца', () => {
        const ids = Array.from({ length: 55 }, (_, index) => `b${index}`);
        const result = sanitizeExtraBadges(ids);
        expect(result).toHaveLength(UI_SETTINGS_EXTRA_BADGES_MAX);
        expect(UI_SETTINGS_EXTRA_BADGES_MAX).toBe(40);
        expect(result[0]).toBe('b0');
        expect(result[result.length - 1]).toBe('b39');
    });
});

describe('ui-settings-slice — добавленные бейджи «Разборов звонков»', () => {
    it('по умолчанию ничего не добавлено', () => {
        expect(initial().callsListExtraBadges).toEqual([]);
    });

    it('пользователь меняет список — он сохраняется чистым', () => {
        const state = uiSettingsReducer(
            initial(),
            uiSettingsActions.setCallsListExtraBadges(['no_price', 'no_price', 'm:greeting']),
        );
        expect(state.callsListExtraBadges).toEqual(['no_price', 'm:greeting']);
    });

    it('пустой список очищает добавленное', () => {
        const filled = uiSettingsReducer(
            initial(),
            uiSettingsActions.setCallsListExtraBadges(['no_price']),
        );
        expect(
            uiSettingsReducer(filled, uiSettingsActions.setCallsListExtraBadges([]))
                .callsListExtraBadges,
        ).toEqual([]);
    });

    it('список в блобе: сборка → JSON → гидратация возвращает тот же список', () => {
        const edited = uiSettingsReducer(
            initial(),
            uiSettingsActions.setCallsListExtraBadges(['no_price', 'm:greeting']),
        );
        const blob: UiSettingsBlob = {
            version: 1,
            updatedAt: '2026-11-25T10:00:00.000Z',
            callsList: { extraBadges: edited.callsListExtraBadges },
        };
        const restored = JSON.parse(JSON.stringify(blob)) as UiSettingsBlob;
        const state = uiSettingsReducer(
            initial(),
            uiSettingsActions.hydrateCallsListSettings(restored.callsList ?? {}),
        );
        expect(state.callsListExtraBadges).toEqual(['no_price', 'm:greeting']);
    });

    it('гидратация чистит испорченный блоб и не трогает остальное состояние', () => {
        const state = uiSettingsReducer(
            { ...initial(), hydrated: true, touchCount: 3 },
            uiSettingsActions.hydrateCallsListSettings({ extraBadges: ['ok', 7, 'ok', ''] }),
        );
        expect(state).toEqual({ hydrated: true, touchCount: 3, callsListExtraBadges: ['ok'] });
        expect(
            uiSettingsReducer(state, uiSettingsActions.hydrateCallsListSettings({}))
                .callsListExtraBadges,
        ).toEqual([]);
    });
});
