import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLazyReveal } from './lazy-reveal';

/**
 * Ленивый показ секции истории (todo Б5).
 *
 * Что здесь защищается:
 * 1. пока раскрытый контент не попал во вьюпорт — загрузка не стартует;
 * 2. первое пересечение зовёт onReveal РОВНО один раз и гасит наблюдатель;
 * 3. свёртка карточки (контент размонтирован → attach(null)) отцепляет
 *    наблюдатель, повторное раскрытие вешает новый — показ всё ещё возможен;
 * 4. окружение без IntersectionObserver — fail-open: грузим сразу, как до
 *    ленивости (иначе секция не загрузилась бы никогда).
 */

/** Фейковый наблюдатель: регистрирует экземпляры, пересечения шлют тесты. */
class FakeIntersectionObserver {
    static instances: FakeIntersectionObserver[] = [];
    observed: unknown[] = [];
    isDisconnected = false;

    constructor(private readonly callback: IntersectionObserverCallback) {
        FakeIntersectionObserver.instances.push(this);
    }

    observe(node: unknown): void {
        this.observed.push(node);
    }

    disconnect(): void {
        this.isDisconnected = true;
    }

    emit(isIntersecting: boolean): void {
        this.callback(
            [{ isIntersecting } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver,
        );
    }
}

const node = {} as Element;

const lastObserver = (): FakeIntersectionObserver => {
    const observer = FakeIntersectionObserver.instances.at(-1);
    if (!observer) throw new Error('наблюдатель не создавался');
    return observer;
};

beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('createLazyReveal: показ раскрытой секции во вьюпорте', () => {
    it('до пересечения onReveal молчит, узел под наблюдением', () => {
        const onReveal = vi.fn();
        const reveal = createLazyReveal(onReveal);

        reveal.attach(node);

        expect(onReveal).not.toHaveBeenCalled();
        expect(reveal.revealed).toBe(false);
        expect(lastObserver().observed).toEqual([node]);
    });

    it('не-пересекающая запись игнорируется, пересечение зовёт один раз и гасит наблюдатель', () => {
        const onReveal = vi.fn();
        const reveal = createLazyReveal(onReveal);
        reveal.attach(node);

        lastObserver().emit(false);
        expect(onReveal).not.toHaveBeenCalled();

        lastObserver().emit(true);
        expect(onReveal).toHaveBeenCalledTimes(1);
        expect(reveal.revealed).toBe(true);
        expect(lastObserver().isDisconnected).toBe(true);

        // Запоздавшая запись отключённого наблюдателя — тишина.
        lastObserver().emit(true);
        expect(onReveal).toHaveBeenCalledTimes(1);
    });

    it('после показа повторный attach наблюдателя не вешает', () => {
        const onReveal = vi.fn();
        const reveal = createLazyReveal(onReveal);
        reveal.attach(node);
        lastObserver().emit(true);

        reveal.attach(node);

        expect(FakeIntersectionObserver.instances).toHaveLength(1);
        expect(onReveal).toHaveBeenCalledTimes(1);
    });

    it('свёртка (attach null) отцепляет, повторное раскрытие наблюдает заново', () => {
        const onReveal = vi.fn();
        const reveal = createLazyReveal(onReveal);
        reveal.attach(node);
        const first = lastObserver();

        // Контент размонтирован — свернули до первого показа.
        reveal.attach(null);
        expect(first.isDisconnected).toBe(true);

        // Пересечение УЖЕ отцепленного наблюдателя не считается показом:
        // карточка свёрнута — грузить нечего.
        first.emit(true);
        expect(onReveal).not.toHaveBeenCalled();

        // Раскрыли снова — новый наблюдатель, показ срабатывает.
        reveal.attach(node);
        expect(FakeIntersectionObserver.instances).toHaveLength(2);
        lastObserver().emit(true);
        expect(onReveal).toHaveBeenCalledTimes(1);
    });

    it('dispose отключает наблюдатель (unmount)', () => {
        const onReveal = vi.fn();
        const reveal = createLazyReveal(onReveal);
        reveal.attach(node);

        reveal.dispose();

        expect(lastObserver().isDisconnected).toBe(true);
        lastObserver().emit(true);
        expect(onReveal).not.toHaveBeenCalled();
    });

    it('окружение без IntersectionObserver — fail-open: показ сразу при attach узла', () => {
        vi.unstubAllGlobals();
        const onReveal = vi.fn();
        const reveal = createLazyReveal(onReveal);

        // Без узла (свёрнута) показа нет и в fail-open.
        reveal.attach(null);
        expect(onReveal).not.toHaveBeenCalled();

        reveal.attach(node);
        expect(onReveal).toHaveBeenCalledTimes(1);
        expect(reveal.revealed).toBe(true);
    });
});
