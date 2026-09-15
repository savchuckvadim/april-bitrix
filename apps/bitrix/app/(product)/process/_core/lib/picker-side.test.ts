import { describe, expect, it } from 'vitest';
import {
    PICKER_PANEL_WIDTH_PX,
    PICKER_VIEWPORT_PADDING_PX,
    resolvePickerSide,
} from '@workspace/theme';

/**
 * Палитра цветовых схем в шапке раздела: с какой стороны кнопки открывается.
 *
 * Регрессия 14.09.2026: на страницах `/process/**` переключатель стоит в
 * правом конце строки, а сторона по умолчанию была 'start' — панель росла
 * вправо от кнопки и уезжала за край окна. Здесь проверяется правило выбора
 * стороны; числа берутся из ширины панели, а не вписаны руками.
 */
describe('resolvePickerSide', () => {
    const VIEWPORT = 1440;
    /** Кнопка-свотч 20px в 12px от правого края — как в шапке раздела. */
    const rightEdgeTrigger = {
        triggerLeft: VIEWPORT - 12 - 20,
        triggerRight: VIEWPORT - 12,
        viewportWidth: VIEWPORT,
    };
    /** Та же кнопка у левого края — как в шапке отчёта kpi-sales. */
    const leftEdgeTrigger = {
        triggerLeft: 12,
        triggerRight: 32,
        viewportWidth: VIEWPORT,
    };

    it('панель шире, чем зазор до правого края — иначе тест бессмыслен', () => {
        const gap = VIEWPORT - rightEdgeTrigger.triggerLeft;
        expect(PICKER_PANEL_WIDTH_PX).toBeGreaterThan(gap);
    });

    it('кнопка у правого края: сторона «влево» сохраняется', () => {
        expect(resolvePickerSide({ preferred: 'end', ...rightEdgeTrigger })).toBe(
            'end',
        );
    });

    it('кнопка у правого края: ошибочная сторона «вправо» исправляется', () => {
        // Это и была регрессия: вызов без пропса получал 'start'.
        expect(
            resolvePickerSide({ preferred: 'start', ...rightEdgeTrigger }),
        ).toBe('end');
    });

    it('кнопка у левого края: сторона «вправо» сохраняется', () => {
        expect(resolvePickerSide({ preferred: 'start', ...leftEdgeTrigger })).toBe(
            'start',
        );
    });

    it('кнопка у левого края: ошибочная сторона «влево» исправляется', () => {
        expect(resolvePickerSide({ preferred: 'end', ...leftEdgeTrigger })).toBe(
            'start',
        );
    });

    it('в середине экрана места хватает с обеих сторон — желание уважается', () => {
        const middle = {
            triggerLeft: 700,
            triggerRight: 720,
            viewportWidth: VIEWPORT,
        };
        expect(resolvePickerSide({ preferred: 'start', ...middle })).toBe('start');
        expect(resolvePickerSide({ preferred: 'end', ...middle })).toBe('end');
    });

    it('узкое окно: обе стороны с вылетом — выбирается меньшая потеря', () => {
        // Окно уже панели: слева от кнопки места больше, значит 'end'.
        const narrow = {
            triggerLeft: PICKER_PANEL_WIDTH_PX - 40,
            triggerRight: PICKER_PANEL_WIDTH_PX - 20,
            viewportWidth: PICKER_PANEL_WIDTH_PX - 10,
        };
        expect(resolvePickerSide({ preferred: 'start', ...narrow })).toBe('end');
    });

    it('граница: панель ровно упирается в отступ от края — сторона держится', () => {
        const exact = {
            triggerLeft: VIEWPORT - PICKER_VIEWPORT_PADDING_PX - PICKER_PANEL_WIDTH_PX,
            triggerRight:
                VIEWPORT - PICKER_VIEWPORT_PADDING_PX - PICKER_PANEL_WIDTH_PX + 20,
            viewportWidth: VIEWPORT,
        };
        expect(resolvePickerSide({ preferred: 'start', ...exact })).toBe('start');
    });
});
