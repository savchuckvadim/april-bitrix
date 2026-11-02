import { describe, expect, it } from 'vitest';
import {
    RENEWAL_FALLBACK_PATH,
    shouldRedirectHome,
} from './renewal-offer.failure';

describe('куда ведёт неоткрывшееся предложение', () => {
    it('недействующую ссылку уводим на главную', () => {
        // Отозвана, истекла или не существует — показывать нечего.
        expect(shouldRedirectHome('gone')).toBe(true);
    });

    it('сбой бэкенда на главную НЕ уводим', () => {
        // Ссылка, скорее всего, живая: уведём — клиент решит, что
        // предложение отменили, вместо того чтобы зайти позже.
        expect(shouldRedirectHome('error')).toBe(false);
    });

    it('уводим сразу на /home, без лишнего перехода через корень', () => {
        // middleware перебрасывает '/' на '/home' безусловно.
        expect(RENEWAL_FALLBACK_PATH).toBe('/home');
    });
});
