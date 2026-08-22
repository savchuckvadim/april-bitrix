import { describe, expect, it } from 'vitest';
import type { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import { KEY_CONTACT_TRAIT_CODES, keyTraits } from './contact-field-view';

const trait = (code: string): PBXContactFieldData =>
    ({ bitrixId: `UF_${code}`, field: { code, name: code }, items: [] }) as never;

describe('keyTraits', () => {
    it('оставляет ЛПР, отношение к Гаранту и к конкуренту — в этом порядке', () => {
        const picked = keyTraits([
            trait('ork_needs'),
            trait('ork_contact_concurent'),
            trait('ork_is_lpr'),
            trait('ork_call_frequency'),
            trait('ork_contact_garant'),
        ]);
        expect(picked.map(item => item.field.code)).toEqual(
            KEY_CONTACT_TRAIT_CODES,
        );
    });

    it('чего нет у контакта — пропускает, не оставляя дырок', () => {
        const picked = keyTraits([trait('ork_contact_garant')]);
        expect(picked.map(item => item.field.code)).toEqual([
            'ork_contact_garant',
        ]);
    });

    it('характеристик нет вовсе — пусто', () => {
        expect(keyTraits(undefined)).toEqual([]);
        expect(keyTraits([])).toEqual([]);
    });
});
