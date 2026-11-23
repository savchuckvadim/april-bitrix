/**
 * Слоты по ролям и подписи ролей: четыре слота всегда в одном порядке,
 * картинка попадает в слот своей роли.
 */

import { describe, expect, it } from 'vitest';
import {
    PROVIDER_IMAGE_ROLE,
    PROVIDER_IMAGE_ROLES,
    type ProviderImage,
    type ProviderImageRole,
} from '../model';
import { buildProviderImageSlots, hasNoProviderImages } from './provider-image-slots.util';

const image = (role: ProviderImageRole, id: string): ProviderImage => ({
    id,
    rqId: 7,
    role,
    format: 'png',
    width: 600,
    height: 400,
    size: 1024,
    originalName: null,
    createdAt: null,
    updatedAt: null,
});

describe('подписи ролей', () => {
    it('четыре роли в порядке экрана с русскими подписями', () => {
        expect(PROVIDER_IMAGE_ROLES.map((meta) => [meta.role, meta.label])).toEqual([
            ['stamp', 'Печать'],
            ['signature_director', 'Подпись руководителя'],
            ['signature_accountant', 'Подпись главного бухгалтера'],
            ['logo', 'Логотип'],
        ]);
    });

    it('у каждой роли есть подсказка, где картинка печатается', () => {
        for (const meta of PROVIDER_IMAGE_ROLES) {
            expect(meta.hint.length, meta.role).toBeGreaterThan(10);
        }
    });

    it('значения ролей совпадают с контрактом бэка', () => {
        expect(Object.values(PROVIDER_IMAGE_ROLE).sort()).toEqual(
            ['logo', 'signature_accountant', 'signature_director', 'stamp'],
        );
    });
});

describe('buildProviderImageSlots', () => {
    it('список ещё не пришёл или пуст — четыре пустых слота', () => {
        for (const images of [undefined, []]) {
            const slots = buildProviderImageSlots(images);
            expect(slots.map((slot) => slot.role)).toEqual(
                PROVIDER_IMAGE_ROLES.map((meta) => meta.role),
            );
            expect(hasNoProviderImages(slots)).toBe(true);
        }
    });

    it('картинка попадает в слот своей роли независимо от порядка в ответе', () => {
        const logo = image('logo', 'id-logo');
        const stamp = image('stamp', 'id-stamp');
        const slots = buildProviderImageSlots([logo, stamp]);
        expect(slots.find((slot) => slot.role === 'stamp')?.image).toBe(stamp);
        expect(slots.find((slot) => slot.role === 'logo')?.image).toBe(logo);
        expect(slots.find((slot) => slot.role === 'signature_director')?.image).toBeNull();
        expect(hasNoProviderImages(slots)).toBe(false);
    });

    it('две картинки одной роли — в слоте последняя из списка', () => {
        const slots = buildProviderImageSlots([image('stamp', 'old'), image('stamp', 'new')]);
        expect(slots[0]?.image?.id).toBe('new');
    });
});
