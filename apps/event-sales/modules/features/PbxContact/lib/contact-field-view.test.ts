import { describe, expect, it } from 'vitest';
import {
    EV_CONTACT_ITEM_PROP,
    PBX_FIELD_TYPE,
    type PBXContactFieldData,
} from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    CONTACT_SCALE_DIRECTION,
    currentItemIndex,
    currentItemName,
    editableTraits,
    shortFieldName,
    traitDirection,
    traitRamp,
    traitsProgress,
} from './contact-field-view';

const field = (current: unknown): PBXContactFieldData =>
    ({
        items: [
            { code: 'no', name: 'Нет' },
            { code: 'maybe', name: 'Возможно' },
            { code: 'yes', name: 'Да' },
        ],
        current,
    }) as unknown as PBXContactFieldData;

describe('shortFieldName', () => {
    it('режет отдельский префикс, смысл оставляет', () => {
        expect(shortFieldName('ОРК Принятие решений')).toBe('Принятие решений');
        expect(shortFieldName('орк  Потребности')).toBe('Потребности');
        expect(shortFieldName('ОП Статус клиента')).toBe('Статус клиента');
    });

    it('имя без префикса и «голый» ОРК не портит', () => {
        expect(shortFieldName('Статус клиента')).toBe('Статус клиента');
        expect(shortFieldName('ОРК')).toBe('ОРК');
        expect(shortFieldName('ОРКестр')).toBe('ОРКестр');
    });
});

describe('currentItemIndex / currentItemName', () => {
    it('находит позицию и имя текущего значения', () => {
        expect(currentItemIndex(field({ code: 'maybe', name: 'Возможно' }))).toBe(1);
        expect(currentItemName(field({ code: 'yes', name: 'Да' }))).toBe('Да');
    });

    it('не заполнено — -1 и null', () => {
        expect(currentItemIndex(field(null))).toBe(-1);
        expect(currentItemName(field(null))).toBeNull();
        expect(currentItemIndex(field('строка'))).toBe(-1);
    });
});

describe('traitDirection / traitRamp', () => {
    it('рост «хорошо» и рост «плохо» красятся по-разному', () => {
        expect(traitDirection(EV_CONTACT_ITEM_PROP.ork_contact_garant)).toBe('up');
        expect(traitDirection(EV_CONTACT_ITEM_PROP.ork_contact_concurent)).toBe(
            'down',
        );
        expect(traitRamp(EV_CONTACT_ITEM_PROP.ork_contact_garant)).not.toEqual(
            traitRamp(EV_CONTACT_ITEM_PROP.ork_contact_concurent),
        );
    });

    it('характеристика без оценки — нейтральная рампа', () => {
        expect(traitDirection(EV_CONTACT_ITEM_PROP.ork_call_frequency)).toBe(
            'neutral',
        );
    });

    it('незнакомый код не оценивает наугад', () => {
        expect(traitDirection('ork_something_new')).toBe('neutral');
    });

    it('у каждой характеристики направление задано явно', () => {
        for (const code of Object.values(EV_CONTACT_ITEM_PROP)) {
            expect(CONTACT_SCALE_DIRECTION[code]).toBeDefined();
        }
    });
});

describe('editableTraits / traitsProgress', () => {
    const trait = (
        type: PBX_FIELD_TYPE,
        current: unknown,
        items = [{ code: 'a', name: 'A' }],
    ): PBXContactFieldData =>
        ({ items, current, field: { type, code: 'x' } }) as unknown as PBXContactFieldData;

    it('строковые поля и поля без значений шкалой не правятся', () => {
        const fields = [
            trait(PBX_FIELD_TYPE.ENUM, null),
            trait(PBX_FIELD_TYPE.SELECT, null),
            trait(PBX_FIELD_TYPE.STRING, 'текст'),
            trait(PBX_FIELD_TYPE.ENUM, null, []),
        ];
        expect(editableTraits(fields)).toHaveLength(2);
        expect(editableTraits(undefined)).toEqual([]);
    });

    it('считает заполненные', () => {
        const fields = [
            trait(PBX_FIELD_TYPE.ENUM, { code: 'a', name: 'A' }),
            trait(PBX_FIELD_TYPE.ENUM, null),
        ];
        expect(traitsProgress(fields)).toEqual({ filled: 1, total: 2 });
    });
});
