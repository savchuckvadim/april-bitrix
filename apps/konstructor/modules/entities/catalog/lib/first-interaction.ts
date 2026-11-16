/**
 * Начал ли менеджер работать на этой странице: первый клик или нажатие
 * клавиши. До этого момента свежий каталог можно подменить молча — на экране
 * ещё ничего не выбрано. После — подмена отложена до следующего открытия:
 * цены не должны меняться под рукой.
 */
let acted = false;

if (typeof window !== 'undefined') {
    const mark = (): void => {
        acted = true;
    };
    window.addEventListener('pointerdown', mark, { once: true, capture: true });
    window.addEventListener('keydown', mark, { once: true, capture: true });
}

export const hasUserActed = (): boolean => acted;
