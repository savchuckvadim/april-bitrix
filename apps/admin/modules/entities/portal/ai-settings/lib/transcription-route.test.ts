import { describe, expect, it } from 'vitest';
import {
    ROUTE_NOT_SET,
    draftToRoute,
    emptyRouteSlot,
    routeSlotHasModel,
    routeToDraft,
} from './transcription-route';

describe('маршрут распознавания: черновик формы', () => {
    it('нет маршрута — пустой черновик, обратно — null («как в режиме»)', () => {
        const draft = routeToDraft(null);
        expect(draft.priority).toBe('normal');
        expect(draft.customFallbacks).toBe(false);
        expect(draft.long.provider).toBe(ROUTE_NOT_SET);
        expect(draftToRoute(draft)).toBeNull();
    });

    it('сохранённый маршрут переживает круг «в форму и обратно» без изменений', () => {
        const route = {
            longMinSec: 300,
            long: { provider: 'yandex' as const, model: null },
            short: {
                provider: 'local-whisper' as const,
                model: 'whisper-large-v3-turbo',
            },
            fallbacks: [{ provider: 'bitrix-vibecode' as const, model: null }],
            fast: null,
            precise: {
                provider: 'local-whisper' as const,
                model: 'whisper-large-v3',
            },
            priority: 'precise' as const,
        };
        expect(draftToRoute(routeToDraft(route))).toEqual(route);
    });

    it('пустой свой список запасных — «без запасных», а не «как в режиме»', () => {
        const draft = { ...routeToDraft(null), customFallbacks: true };
        expect(draftToRoute(draft)).toMatchObject({ fallbacks: [] });
    });

    it('запасные: пустые строки и повторы выбрасываются', () => {
        const draft = {
            ...routeToDraft(null),
            customFallbacks: true,
            fallbacks: [
                { provider: 'yandex', model: '' },
                emptyRouteSlot(),
                { provider: 'yandex', model: 'что-то' },
            ],
        };
        expect(draftToRoute(draft)).toMatchObject({
            fallbacks: [{ provider: 'yandex', model: null }],
        });
    });

    it('у Яндекса модель не сохраняется; модель других обрезается по краям', () => {
        expect(routeSlotHasModel('yandex')).toBe(false);
        expect(routeSlotHasModel(ROUTE_NOT_SET)).toBe(false);
        const draft = {
            ...routeToDraft(null),
            short: { provider: 'bitrix-vibecode', model: '  bitrix/x  ' },
        };
        expect(draftToRoute(draft)).toMatchObject({
            short: { provider: 'bitrix-vibecode', model: 'bitrix/x' },
        });
    });

    it('порог длинного звонка — целое в границах, иначе русская ошибка', () => {
        expect(
            draftToRoute({ ...routeToDraft(null), longMinSec: '10' }),
        ).toMatch(/Длинный звонок/);
        expect(
            draftToRoute({ ...routeToDraft(null), longMinSec: '6,5' }),
        ).toMatch(/целое число/);
        expect(
            draftToRoute({ ...routeToDraft(null), longMinSec: ' 900 ' }),
        ).toMatchObject({ longMinSec: 900 });
    });

    it('приоритет «обычно» без ролей — пусто; «скорость» без ролей сохраняется', () => {
        expect(
            draftToRoute({ ...routeToDraft(null), priority: 'normal' }),
        ).toBeNull();
        expect(
            draftToRoute({ ...routeToDraft(null), priority: 'fast' }),
        ).toMatchObject({ priority: 'fast', fast: null });
    });
});
