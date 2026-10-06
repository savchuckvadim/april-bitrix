/**
 * `BitrixBaseApi.resizeToContent()`: подгонка фрейма под контент.
 *
 * Скрытый фрейм (в карточке переключили вкладку) имеет нулевую ширину, и SDK
 * отклоняет промис «Wrong width:number = 0 or height:number = 607».
 * Необработанное отклонение роняло «Звонки» в «Что-то пошло не так» при
 * возврате на вкладку (разбор 05.10.2026).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BitrixBaseApi } from '../bitrix-base-api';
import { isFrameMeasurable } from '../../lib/frame-size.util';

/** Фрейм SDK — только то, что зовёт resizeToContent. */
interface FakeFrame {
    parent: { resizeWindowAuto: ReturnType<typeof vi.fn> };
}

interface FrameState {
    bx: FakeFrame;
    inFrame: boolean;
}

const createApi = () =>
    new BitrixBaseApi({ sendMessageAdminError: async () => {} });

const enterFrame = (api: BitrixBaseApi, resize: FakeFrame['parent']['resizeWindowAuto']) => {
    const state = api as unknown as FrameState;
    state.bx = { parent: { resizeWindowAuto: resize } };
    state.inFrame = true;
};

/** Ширина body, как её видит SDK. */
const stubBodyWidth = (width: number) => {
    vi.stubGlobal('document', {
        body: { scrollWidth: width, offsetWidth: width },
    });
};

describe('BitrixBaseApi.resizeToContent', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('вне фрейма → null, SDK не трогаем', () => {
        expect(createApi().resizeToContent(null, 600)).toBeNull();
    });

    it('фрейм скрыт (ширина 0) → подгонка пропущена, SDK не зовём', () => {
        const resize = vi.fn();
        const api = createApi();
        enterFrame(api, resize);
        stubBodyWidth(0);

        expect(api.resizeToContent(null, 600)).toBeNull();
        expect(resize).not.toHaveBeenCalled();
    });

    it('фрейм виден → SDK получает узел и пол высоты, без ширины', async () => {
        const resize = vi.fn().mockResolvedValue({ ok: true });
        const api = createApi();
        enterFrame(api, resize);
        stubBodyWidth(1280);

        await api.resizeToContent(null, 600);

        expect(resize).toHaveBeenCalledWith(null, 600);
    });

    it('задан пол ширины → он уходит в SDK третьим аргументом', async () => {
        const resize = vi.fn().mockResolvedValue({ ok: true });
        const api = createApi();
        enterFrame(api, resize);
        stubBodyWidth(1280);

        await api.resizeToContent(null, 600, 900);

        expect(resize).toHaveBeenCalledWith(null, 600, 900);
    });

    it('SDK отклонил подгонку → null, а не необработанное отклонение', async () => {
        const resize = vi
            .fn()
            .mockRejectedValue(
                new Error('Wrong width:number = 0 or height:number = 607'),
            );
        const api = createApi();
        enterFrame(api, resize);
        stubBodyWidth(1280);

        await expect(api.resizeToContent(null, 600)).resolves.toBeNull();
    });
});

describe('isFrameMeasurable', () => {
    it('нет документа или body — мерить нечего', () => {
        expect(isFrameMeasurable(null)).toBe(false);
    });

    it('нулевая ширина — фрейм скрыт', () => {
        expect(isFrameMeasurable({ scrollWidth: 0, offsetWidth: 0 })).toBe(
            false,
        );
    });

    it('ширина есть хотя бы в одном из замеров — фрейм виден', () => {
        expect(isFrameMeasurable({ scrollWidth: 0, offsetWidth: 640 })).toBe(
            true,
        );
    });
});
