import { describe, expect, it } from 'vitest';
import {
    BROWSER_UI_PX,
    SMALL_FRAME_MIN_HEIGHT,
    isDetailTabPlacement,
    smallFrameHeight,
} from '../small-frame.util';

describe('smallFrameHeight', () => {
    it('окно браузера за вычетом его интерфейса', () => {
        expect(smallFrameHeight(1032, 1032)).toBe(1032 - BROWSER_UI_PX);
    });

    it('окно на полэкрана — по окну, не по монитору', () => {
        expect(smallFrameHeight(800, 1032)).toBe(800 - BROWSER_UI_PX);
    });

    it('нет размеров окна — по экрану; низкое окно — не ниже пола', () => {
        expect(smallFrameHeight(0, 1000)).toBe(1000 - BROWSER_UI_PX);
        expect(smallFrameHeight(500, 1000)).toBe(SMALL_FRAME_MIN_HEIGHT);
    });
});

describe('isDetailTabPlacement', () => {
    it('вкладки карточек — маленький экран', () => {
        expect(isDetailTabPlacement('CRM_DEAL_DETAIL_TAB')).toBe(true);
        expect(isDetailTabPlacement('CRM_COMPANY_DETAIL_TAB')).toBe(true);
        expect(isDetailTabPlacement('CRM_DEAL_DETAIL_ACTIVITY')).toBe(false);
        expect(isDetailTabPlacement(undefined)).toBe(false);
    });
});
