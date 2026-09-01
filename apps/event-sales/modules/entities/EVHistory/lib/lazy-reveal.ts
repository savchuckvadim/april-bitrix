/**
 * «Показ» ленивой секции: узел раскрытой карточки попал во вьюпорт.
 *
 * Отделено от React, чтобы семантика наблюдателя жила под тестами (vitest —
 * node-окружение, DOM-рендера нет): хук use-lazy-reveal — тонкий адаптер.
 *
 * Контракт:
 * - `attach(node)` — callback-ref контента карточки: свёрнутая секция свой
 *   контент НЕ монтирует (Radix Collapsible), поэтому «раскрыта» здесь не
 *   отдельный флаг, а сам факт существования узла;
 * - срабатывание ОДНО на контроллер: первое пересечение зовёт onReveal и
 *   гасит наблюдатель навсегда (сворачивание/раскрытие после — тишина);
 * - окружение без IntersectionObserver (jsdom, древний webview) — fail-open:
 *   раскрытый узел считается видимым сразу — грузим, как грузили до
 *   ленивости, лишь бы не «никогда».
 */
export interface LazyReveal {
    /** Привязать/отвязать наблюдаемый узел (callback-ref из React). */
    attach(node: Element | null): void;
    /** Показ уже случился (навсегда true после первого срабатывания). */
    readonly revealed: boolean;
    /** Снять наблюдатель (unmount компонента). */
    dispose(): void;
}

export const createLazyReveal = (onReveal: () => void): LazyReveal => {
    let revealed = false;
    let observer: IntersectionObserver | null = null;

    const disconnect = () => {
        observer?.disconnect();
        observer = null;
    };

    const fire = () => {
        if (revealed) return;
        revealed = true;
        disconnect();
        onReveal();
    };

    return {
        get revealed() {
            return revealed;
        },
        attach(node) {
            // Узел сменился (перемонтирование контента) — старый наблюдатель
            // отцепляется всегда, даже когда нового узла нет (свернули).
            disconnect();
            if (revealed || !node) return;
            if (typeof IntersectionObserver === 'undefined') {
                fire();
                return;
            }
            const own = new IntersectionObserver(entries => {
                // Запоздавший колбэк уже отцепленного наблюдателя (свернули
                // ровно между постановкой записи и её доставкой) — не показ.
                if (observer !== own) return;
                if (entries.some(entry => entry.isIntersecting)) fire();
            });
            observer = own;
            own.observe(node);
        },
        dispose: disconnect,
    };
};
