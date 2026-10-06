/** Узел, по которому SDK меряет ширину фрейма. */
type MeasuredBody = Pick<HTMLElement, 'scrollWidth' | 'offsetWidth'>;

const currentBody = (): MeasuredBody | null =>
    typeof document === 'undefined' ? null : document.body;

/**
 * Есть ли у фрейма что мерить.
 *
 * Скрытый фрейм (в карточке переключили вкладку, слайдер свернули) имеет
 * нулевую ширину body. SDK считает ширину именно так —
 * `max(body.scrollWidth, body.offsetWidth)` — и на нуле НЕ молчит, а
 * отклоняет промис «Wrong width:number = 0 or height:number = …».
 * Проверяем то же самое до вызова: мерить нечего — подгонку пропускаем.
 */
export const isFrameMeasurable = (
    body: MeasuredBody | null = currentBody(),
): boolean => {
    if (!body) return false;
    return Math.max(body.scrollWidth, body.offsetWidth) > 0;
};
