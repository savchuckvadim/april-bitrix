import { describe, expect, it } from 'vitest';
import { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import type { BadgeItem } from '../model/badge-catalog.type';
import {
    applyBadgeToComment,
    composeEventTitle,
    filterCommentBadges,
    filterTitleBadges,
    findDefaultTitleBadge,
} from './badge-visibility';

const badge = (over: Partial<BadgeItem>): BadgeItem => ({
    code: 'x',
    text: 'Текст',
    target: 'comment',
    tone: 'neutral',
    outcomes: [],
    planTypes: [],
    isDefault: false,
    sort: 0,
    ...over,
});

describe('filterCommentBadges', () => {
    const items = [
        badge({ code: 'always' }),
        badge({ code: 'fail', outcomes: ['fail'] }),
        badge({ code: 'aside', outcomes: ['setAside'] }),
        badge({ code: 'pres', outcomes: ['presentationDone'] }),
        badge({ code: 'title', target: 'title' }),
    ];

    it('пустые привязки — всегда; статус — по совпадению; название не попадает', () => {
        const codes = filterCommentBadges(items, {
            workStatus: 'fail',
            presentationDone: false,
        }).map(item => item.code);
        expect(codes).toEqual(['always', 'fail']);
    });

    // «Провёл, думают» нужен при любом статусе — но только после презентации.
    it('presentationDone показывается при любом статусе, если презентация была', () => {
        const codes = filterCommentBadges(items, {
            workStatus: 'inJob',
            presentationDone: true,
        }).map(item => item.code);
        expect(codes).toEqual(['always', 'pres']);
    });
});

describe('filterTitleBadges / findDefaultTitleBadge', () => {
    const items = [
        badge({ code: 'warm', target: 'title', isDefault: true, planTypes: [EV_PLAN_CODE.WARM] }),
        badge({ code: 'pres', target: 'title', isDefault: true, planTypes: [EV_PLAN_CODE.PRESENTATION] }),
        badge({ code: 'kp', target: 'title', planTypes: [EV_PLAN_CODE.WARM, EV_PLAN_CODE.REFINE] }),
        badge({ code: 'any', target: 'title' }),
        badge({ code: 'comment' }),
    ];

    it('уточнения — без основного, под тип или для всех', () => {
        expect(filterTitleBadges(items, EV_PLAN_CODE.WARM).map(i => i.code)).toEqual(['kp', 'any']);
        expect(filterTitleBadges(items, EV_PLAN_CODE.HOT).map(i => i.code)).toEqual(['any']);
    });

    it('основной — свой для каждого типа; без типа — null', () => {
        expect(findDefaultTitleBadge(items, EV_PLAN_CODE.PRESENTATION)?.code).toBe('pres');
        expect(findDefaultTitleBadge(items, EV_PLAN_CODE.HOT)).toBeNull();
        expect(findDefaultTitleBadge(items, null)).toBeNull();
    });
});

describe('composeEventTitle', () => {
    it('с клиентом — через тире, без клиента — просто текст', () => {
        expect(composeEventTitle('Звонок', 'ООО Ромашка')).toBe('Звонок — ООО Ромашка');
        expect(composeEventTitle('Звонок ', '  ')).toBe('Звонок');
    });
});

describe('applyBadgeToComment', () => {
    it('пусто — текст целиком', () => {
        expect(applyBadgeToComment('', 'Просил перезвонить')).toBe('Просил перезвонить');
    });

    it('есть текст — дописывает через точку; после знака конца — без точки', () => {
        expect(applyBadgeToComment('Поговорили с юристом', 'Выслал доступ')).toBe(
            'Поговорили с юристом. Выслал доступ',
        );
        expect(applyBadgeToComment('Поговорили!', 'Выслал доступ')).toBe(
            'Поговорили! Выслал доступ',
        );
    });

    // Второй клик по тому же бейджику не раздувает комментарий.
    it('тот же текст уже стоит — без изменений', () => {
        expect(applyBadgeToComment('Выслал доступ. Думают', 'выслал доступ')).toBe(
            'Выслал доступ. Думают',
        );
    });
});
