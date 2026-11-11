import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
    openSlider: vi.fn<(path: string) => Promise<boolean>>(),
    getService: vi.fn(),
}));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: { getService: h.getService },
}));

import { openPortalCard } from './open-portal-card';

const PATH = '/company/personal/user/439/tasks/task/view/800805/';
const URL_ = `https://portal.bitrix24.ru${PATH}`;

describe('openPortalCard', () => {
    const open = vi.fn();

    beforeEach(() => {
        h.openSlider.mockReset();
        h.getService.mockReset();
        h.getService.mockReturnValue({ api: { openSlider: h.openSlider } });
        open.mockReset();
        vi.stubGlobal('window', { open });
        vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('слайдер открылся — новая вкладка не нужна', async () => {
        h.openSlider.mockResolvedValue(true);

        await expect(openPortalCard(PATH, URL_)).resolves.toBe(true);
        expect(h.openSlider).toHaveBeenCalledWith(PATH);
        expect(open).not.toHaveBeenCalled();
    });

    it('слайдер отказал (вне фрейма) — открываем вкладку', async () => {
        h.openSlider.mockResolvedValue(false);

        await expect(openPortalCard(PATH, URL_)).resolves.toBe(true);
        expect(open).toHaveBeenCalledWith(URL_, '_blank', 'noreferrer');
    });

    it('сервиса Битрикса нет (dev) — ошибка не наружу, открываем вкладку', async () => {
        h.getService.mockImplementation(() => {
            throw new Error('Bitrix service is not initialized');
        });

        await expect(openPortalCard(PATH, URL_)).resolves.toBe(true);
        expect(open).toHaveBeenCalledWith(URL_, '_blank', 'noreferrer');
    });

    it('нет пути — слайдер не трогаем, сразу вкладка', async () => {
        await expect(openPortalCard(null, URL_)).resolves.toBe(true);
        expect(h.getService).not.toHaveBeenCalled();
        expect(open).toHaveBeenCalledOnce();
    });

    it('слайдер не открылся и ссылки нет — false, ничего не открыто', async () => {
        h.openSlider.mockResolvedValue(false);

        await expect(openPortalCard(PATH, null)).resolves.toBe(false);
        expect(open).not.toHaveBeenCalled();
    });
});
