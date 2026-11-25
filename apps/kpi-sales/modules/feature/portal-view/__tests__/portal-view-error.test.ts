import { describe, expect, it } from 'vitest';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { portalViewSaveErrorMessage } from '../lib/portal-view-error';

const httpError = (status: number, message?: string) => ({
    message: `Request failed with status code ${status}`,
    response: { status, data: message === undefined ? {} : { resultCode: 1, message } },
});

describe('portalViewSaveErrorMessage', () => {
    it('403 — «меняет руководитель группы и выше»', () => {
        expect(portalViewSaveErrorMessage(httpError(403))).toBe(
            'Настройки отчёта меняет руководитель группы и выше',
        );
    });

    it('403 с техническим текстом сервера — всё равно понятная фраза', () => {
        expect(portalViewSaveErrorMessage(httpError(403, 'Forbidden'))).toBe(
            PORTAL_VIEW_TEXT.errors.forbidden,
        );
    });

    it('понятный русский текст сервера показывается как есть', () => {
        expect(
            portalViewSaveErrorMessage(httpError(400, 'Нельзя скрыть все вкладки')),
        ).toBe('Нельзя скрыть все вкладки');
    });

    it('технический текст сервера не показывается', () => {
        expect(portalViewSaveErrorMessage(httpError(500, 'Internal server error'))).toBe(
            PORTAL_VIEW_TEXT.errors.saveFailed,
        );
    });

    it('500 без текста — общий запасной текст, без «status code»', () => {
        const message = portalViewSaveErrorMessage(httpError(500));
        expect(message).toBe(PORTAL_VIEW_TEXT.errors.saveFailed);
        expect(message).not.toMatch(/status code/i);
    });

    it('сеть недоступна — запасной текст', () => {
        expect(portalViewSaveErrorMessage(new Error('Network Error'))).toBe(
            PORTAL_VIEW_TEXT.errors.saveFailed,
        );
    });

    it('ошибка конверта с русским текстом (200 + resultCode 1) показывается', () => {
        expect(portalViewSaveErrorMessage(new Error('Портал не найден'))).toBe(
            'Портал не найден',
        );
    });

    it('не ошибка вовсе (undefined) — запасной текст', () => {
        expect(portalViewSaveErrorMessage(undefined)).toBe(PORTAL_VIEW_TEXT.errors.saveFailed);
    });
});
