import { describe, expect, it } from 'vitest';
import type { InfoblockDetail } from '../../model';
import { toInfoblockFormData } from './infoblock-form-data.util';

const infoblock = {
    id: '53',
    number: 8,
    name: 'Интернет-семинары',
    title: 'Заголовок',
    description: 'Большое описание',
    descriptionForSale: 'Описание для продажи',
    shortDescription: 'Короткое описание',
    code: 'ltsemi',
    weight: '1',
    group_id: '10',
    isLa: false,
    isFree: false,
    isShowing: true,
    isSet: false,
    isProduct: null,
    isPackage: null,
    tag: 'тег',
} as unknown as InfoblockDetail;

describe('toInfoblockFormData', () => {
    it('сохранение формы не теряет тексты: они есть в начальных данных', () => {
        expect(toInfoblockFormData(infoblock)).toMatchObject({
            title: 'Заголовок',
            description: 'Большое описание',
            descriptionForSale: 'Описание для продажи',
            shortDescription: 'Короткое описание',
            tag: 'тег',
        });
    });

    it('группа приходит строкой и из связи, если нет group_id', () => {
        expect(toInfoblockFormData(infoblock).group_id).toBe('10');
        const withRelation = {
            ...infoblock,
            group_id: null,
            group: { id: '7' },
        } as unknown as InfoblockDetail;
        expect(toInfoblockFormData(withRelation).group_id).toBe('7');
    });
});
