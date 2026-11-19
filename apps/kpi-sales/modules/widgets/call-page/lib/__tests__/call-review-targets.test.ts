import { describe, expect, it } from 'vitest';
import {
    callTypeReviewTarget,
    checkpointReviewTarget,
    objectionReviewTarget,
    sectionReviewTarget,
} from '../call-review-targets';

const section = { title: ' Выяснение потребностей ' };
const objection = { categoryTitle: 'Цена', text: 'дорого' };
const checkpoint = { title: 'Назвал следующий шаг' };

describe('call-review-targets — пункты «не так» страницы разбора', () => {
    it('раздел, возражение и пункт методики узнаются по названию', () => {
        expect(sectionReviewTarget(section)).toEqual({
            kind: 'section',
            ref: 'Выяснение потребностей',
            label: 'Выяснение потребностей',
        });
        expect(objectionReviewTarget(objection)).toEqual({
            kind: 'objection',
            ref: 'Цена: дорого',
            label: 'Цена: дорого',
        });
        expect(checkpointReviewTarget(checkpoint)).toEqual({
            kind: 'methodology',
            ref: 'Назвал следующий шаг',
            label: 'Назвал следующий шаг',
        });
    });

    it('тип звонка — с подписью «Тип звонка»; типа нет — отмечать нечего', () => {
        expect(callTypeReviewTarget({ callTypeTitle: 'Холодный' })).toEqual({
            kind: 'call_type',
            ref: 'Холодный',
            label: 'Тип звонка: Холодный',
        });
        expect(callTypeReviewTarget({ callTypeTitle: null })).toBeNull();
    });

    it('длинные названия режутся по пределам бэка', () => {
        const long = objectionReviewTarget({
            ...objection,
            text: 'о'.repeat(400),
        });
        expect(long.ref).toHaveLength(200);
        expect(long.label).toHaveLength(300);
    });
});
