import { describe, expect, it } from 'vitest';
import type { PBXContactFieldData } from '@/modules/entities/EventContact/type/pbx-contact-type';
import {
    currentItemIndex,
    currentItemName,
    shortFieldName,
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
