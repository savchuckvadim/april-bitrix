/**
 * Сторона раскрытия палитры цветовых схем.
 *
 * ЗАЧЕМ. Палитра — это рукописный `position: absolute` внутри кнопки-свотча,
 * без детекции коллизий. Сторона задавалась только пропсом, а кнопка почти
 * всегда стоит в правом конце шапки: при стороне `start` панель шириной
 * ~194px росла вправо от свотча, стоящего в нескольких пикселях от края, и
 * уезжала за экран (страницы `/process/**` в приложении bitrix, 14.09.2026).
 * Пропс остаётся пожеланием вызывающего, но последнее слово — за местом на
 * экране: панель, которой не хватает места с одной стороны, открывается с
 * другой.
 *
 * Чистая функция: измерения приходят параметрами, DOM здесь не трогаем.
 */

/** Ширина панели: 7 колонок по 20px + 6 зазоров по 6px + падинги 8px + рамка. */
export const PICKER_PANEL_WIDTH_PX = 7 * 20 + 6 * 6 + 2 * 8 + 2;

/** Минимальный зазор до края окна, чтобы панель не липла к нему вплотную. */
export const PICKER_VIEWPORT_PADDING_PX = 8;

export type PickerSide = 'start' | 'end';

export interface PickerSideInput {
    /** Чего хочет вызывающий: 'start' — вправо от кнопки, 'end' — влево. */
    preferred: PickerSide;
    /** Левый край кнопки-свотча относительно окна. */
    triggerLeft: number;
    /** Правый край кнопки-свотча относительно окна. */
    triggerRight: number;
    /** Ширина окна. */
    viewportWidth: number;
    panelWidth?: number;
    padding?: number;
}

/** Сколько панели вылезет за край окна при этой стороне (0 — влезает целиком). */
function overflowOf(side: PickerSide, input: Required<PickerSideInput>): number {
    const { triggerLeft, triggerRight, viewportWidth, panelWidth, padding } =
        input;
    if (side === 'start') {
        // Панель прижата левым краем к кнопке и растёт вправо.
        return Math.max(0, triggerLeft + panelWidth - (viewportWidth - padding));
    }
    // Панель прижата правым краем к кнопке и растёт влево.
    return Math.max(0, padding - (triggerRight - panelWidth));
}

/**
 * Сторона раскрытия с учётом места на экране: желаемая, если панель влезает;
 * противоположная, если влезает она; иначе — та, где за край уходит меньше.
 */
export function resolvePickerSide(input: PickerSideInput): PickerSide {
    const filled: Required<PickerSideInput> = {
        panelWidth: PICKER_PANEL_WIDTH_PX,
        padding: PICKER_VIEWPORT_PADDING_PX,
        ...input,
    };
    const preferred = filled.preferred;
    const opposite: PickerSide = preferred === 'start' ? 'end' : 'start';

    const preferredOverflow = overflowOf(preferred, filled);
    if (preferredOverflow === 0) return preferred;

    const oppositeOverflow = overflowOf(opposite, filled);
    return oppositeOverflow < preferredOverflow ? opposite : preferred;
}
