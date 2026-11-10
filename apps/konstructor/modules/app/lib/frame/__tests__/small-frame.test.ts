import { describe, expect, it } from 'vitest';
import {
    BROWSER_UI_PX,
    SMALL_FRAME_MIN_HEIGHT,
    frameTopOffset,
    smallFrameHeight,
} from '../small-frame.util';
import { isSmallDisplayPlacement } from '../../../model/selectors';

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

describe('frameTopOffset', () => {
    it('видно начало фрейма — верх на высоте окна минус видимая часть', () => {
        expect(frameTopOffset(900, { top: 0, height: 600 }, 900)).toBe(300);
    });

    it('фрейм виден целиком или его верх уже за окном — не знаем', () => {
        expect(frameTopOffset(900, { top: 0, height: 900 }, 900)).toBeNull();
        expect(frameTopOffset(900, { top: 120, height: 780 }, 900)).toBeNull();
    });
});

describe('isSmallDisplayPlacement', () => {
    it('вкладки карточек — маленький экран', () => {
        expect(isSmallDisplayPlacement('CRM_DEAL_DETAIL_TAB')).toBe(true);
        expect(isSmallDisplayPlacement('CRM_COMPANY_DETAIL_TAB')).toBe(true);
        expect(isSmallDisplayPlacement('DEFAULT')).toBe(false);
        expect(isSmallDisplayPlacement(undefined)).toBe(false);
    });
});
