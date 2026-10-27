import { describe, expect, it } from 'vitest';
import type { BadgeItem } from '../model';
import {
    copyDefaults,
    findDraftIssues,
    moveBadge,
    newBadge,
    nextBadgeCode,
    sameBadges,
    toggleInList,
} from './badges-draft';

const badge = (over: Partial<BadgeItem>): BadgeItem => ({
    code: 'x',
    text: 'Текст',
    target: 'comment',
    tone: 'neutral',
    outcomes: [],
    planTypes: [],
    isDefault: false,
    sort: 10,
    isActive: true,
    ...over,
});

describe('nextBadgeCode / newBadge', () => {
    it('код не повторяет занятые', () => {
        expect(nextBadgeCode([badge({ code: 'own_1' }), badge({ code: 'own_2' })])).toBe('own_3');
    });

    it('новый бейджик встаёт в конец своей группы', () => {
        const items = [badge({ code: 'a', sort: 10 }), badge({ code: 't', target: 'title', sort: 50 })];
        expect(newBadge(items, 'comment').sort).toBe(20);
        expect(newBadge(items, 'title')).toMatchObject({ sort: 60, tone: 'neutral' });
    });
});

describe('moveBadge', () => {
    const items = [
        badge({ code: 'a', sort: 10 }),
        badge({ code: 'b', sort: 20 }),
        badge({ code: 't', target: 'title', sort: 5 }),
    ];

    it('меняет местами внутри группы, чужую группу не трогает', () => {
        const moved = moveBadge(items, 'b', 'up');
        expect(moved.find(i => i.code === 'b')?.sort).toBe(10);
        expect(moved.find(i => i.code === 'a')?.sort).toBe(20);
        expect(moved.find(i => i.code === 't')?.sort).toBe(5);
    });

    it('у края — без изменений', () => {
        expect(moveBadge(items, 'a', 'up')).toEqual(items);
    });
});

describe('toggleInList', () => {
    it('добавляет и снимает', () => {
        expect(toggleInList(['fail'], 'setAside')).toEqual(['fail', 'setAside']);
        expect(toggleInList(['fail', 'setAside'], 'fail')).toEqual(['setAside']);
    });
});

describe('findDraftIssues', () => {
    it('пустой текст, повтор кода, два основных на тип', () => {
        const issues = findDraftIssues([
            badge({ code: 'a', text: ' ' }),
            badge({ code: 'a', text: 'Дубль' }),
            badge({ code: 't1', target: 'title', isDefault: true, planTypes: ['warm'] }),
            badge({ code: 't2', target: 'title', isDefault: true, planTypes: ['warm'] }),
        ]);
        expect(issues).toHaveLength(3);
    });

    it('чистый набор — без замечаний', () => {
        expect(findDraftIssues([badge({ code: 'a' }), badge({ code: 'b' })])).toEqual([]);
    });
});

describe('copyDefaults / sameBadges', () => {
    it('копия не делит массивы с оригиналом и равна ему по содержанию', () => {
        const defaults = [badge({ code: 'a', outcomes: ['fail'] })];
        const copy = copyDefaults(defaults);
        copy[0]?.outcomes.push('notCa');
        expect(defaults[0]?.outcomes).toEqual(['fail']);
        expect(sameBadges(defaults, copyDefaults(defaults))).toBe(true);
    });

    it('порядок привязок и пробелы текста на равенство не влияют', () => {
        expect(
            sameBadges(
                [badge({ code: 'a', text: 'Т ', outcomes: ['fail', 'notCa'] })],
                [badge({ code: 'a', text: 'Т', outcomes: ['notCa', 'fail'] })],
            ),
        ).toBe(true);
    });
});
