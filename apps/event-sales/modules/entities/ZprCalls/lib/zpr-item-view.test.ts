import { describe, expect, it } from 'vitest';
import { findZprItemKey, mapZprItem } from './zpr-item-view';

/** Элемент, как его отдаёт crm.item.list (camel-ключи UF_CRM_45_ZPR_*). */
const rawItem = {
    id: 501,
    title: 'ЗПР: Звонок по решению',
    stageId: 'DT1038_10:ZPR_PLAN',
    categoryId: 10,
    ufCrm45ZprPlanDate: '2026-08-27T12:00:00+03:00',
    ufCrm45ZprDoneDate: null,
    ufCrm45ZprIsSpontaneous: 'N',
    ufCrm45ZprPlanComment: 'Договорились созвониться после планёрки',
    ufCrm45ZprReportComment: '',
    ufCrm45ZprComments: [
        '25.08.2026 10:00 План: Договорились созвониться после планёрки',
    ],
};

describe('findZprItemKey', () => {
    it('находит фактический camel-ключ по коду поля', () => {
        expect(findZprItemKey(rawItem, 'ZPR_PLAN_DATE')).toBe(
            'ufCrm45ZprPlanDate',
        );
        expect(findZprItemKey(rawItem, 'ZPR_COMMENTS')).toBe(
            'ufCrm45ZprComments',
        );
    });

    it('не путает соседние коды (COMMENT vs COMMENTS)', () => {
        expect(findZprItemKey(rawItem, 'ZPR_PLAN_COMMENT')).toBe(
            'ufCrm45ZprPlanComment',
        );
        expect(findZprItemKey(rawItem, 'ZPR_REPORT_COMMENT')).toBe(
            'ufCrm45ZprReportComment',
        );
    });

    it('нет поля у элемента — null (fail-open)', () => {
        expect(findZprItemKey({ id: 1 }, 'ZPR_PLAN_DATE')).toBeNull();
        // Ключ без typeId-цифр — это не UF-поле смарта.
        expect(
            findZprItemKey({ ufCrmZprPlanDate: 'x' }, 'ZPR_PLAN_DATE'),
        ).toBeNull();
    });
});

describe('mapZprItem', () => {
    it('собирает доменный ЗПР из сырого элемента', () => {
        expect(mapZprItem(rawItem, 1038)).toEqual({
            id: 501,
            entityTypeId: 1038,
            categoryId: 10,
            title: 'ЗПР: Звонок по решению',
            stageId: 'DT1038_10:ZPR_PLAN',
            planDate: '2026-08-27T12:00:00+03:00',
            doneDate: null,
            isSpontaneous: false,
            planComment: 'Договорились созвониться после планёрки',
            reportComment: null,
            comments: [
                '25.08.2026 10:00 План: Договорились созвониться после планёрки',
            ],
        });
    });

    it('булево Y и одиночный комментарий строкой тоже читаются', () => {
        const call = mapZprItem(
            {
                id: '502',
                ufCrm45ZprIsSpontaneous: 'Y',
                ufCrm45ZprComments: 'одна строка',
            },
            1038,
        );
        expect(call?.isSpontaneous).toBe(true);
        expect(call?.comments).toEqual(['одна строка']);
        expect(call?.title).toBe('ЗПР №502');
    });

    it('строка без id — битая, отбрасывается', () => {
        expect(mapZprItem({}, 1038)).toBeNull();
        expect(mapZprItem({ id: 'мусор' }, 1038)).toBeNull();
    });
});
