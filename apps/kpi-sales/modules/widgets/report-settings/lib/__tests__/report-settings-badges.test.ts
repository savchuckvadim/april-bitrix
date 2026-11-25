import { describe, expect, it } from 'vitest';
import type { PortalViewBadgeOption } from '@/modules/feature/portal-view';
import {
    badgeCallTypesText,
    groupBadges,
    splitBadgesByCallTypes,
} from '../report-settings-badges';

const badge = (
    id: string,
    group: PortalViewBadgeOption['group'],
    callTypes: string[] = [],
): PortalViewBadgeOption => ({
    id,
    title: id,
    hint: null,
    group,
    callTypes,
    mainByDefault: false,
});

describe('groupBadges — «Общие» и методика', () => {
    const methodology = { code: 'polyansky', title: 'Методика Полянского' };

    it('две группы с подписями', () => {
        const groups = groupBadges(
            [badge('a', 'general'), badge('m', 'methodology'), badge('b', 'general')],
            methodology,
        );
        expect(groups.map(group => group.title)).toEqual(['Общие', 'Методика Полянского']);
        expect(groups[0]?.badges.map(item => item.id)).toEqual(['a', 'b']);
        expect(groups[1]?.badges.map(item => item.id)).toEqual(['m']);
    });

    it('без бейджей методики второй группы нет, даже если методика задана', () => {
        const groups = groupBadges([badge('a', 'general')], methodology);
        expect(groups.map(group => group.key)).toEqual(['general']);
    });

    it('без общих бейджей — только методика', () => {
        const groups = groupBadges([badge('m', 'methodology')], methodology);
        expect(groups.map(group => group.key)).toEqual(['methodology']);
    });

    it('методика не названа — подпись просто «Методика»', () => {
        const groups = groupBadges([badge('m', 'methodology')], null);
        expect(groups[0]?.title).toBe('Методика');
    });

    it('нет бейджей — нет групп', () => {
        expect(groupBadges([], methodology)).toEqual([]);
    });

    it('порядок бейджей внутри группы сохраняется', () => {
        const groups = groupBadges(
            [badge('z', 'general'), badge('a', 'general'), badge('m', 'general')],
            null,
        );
        expect(groups[0]?.badges.map(item => item.id)).toEqual(['z', 'a', 'm']);
    });
});

describe('badgeCallTypesText — типы звонков мелким текстом', () => {
    it('названия типов, а не коды', () => {
        const text = badgeCallTypesText(badge('m', 'methodology', ['presentation', 'refine']));
        expect(text).toBe('Типы звонков: Презентация, Доработка');
    });

    it('нет типов — показывать нечего', () => {
        expect(badgeCallTypesText(badge('m', 'methodology', []))).toBeNull();
    });

    it('неизвестный код пользователю не показывается', () => {
        expect(badgeCallTypesText(badge('m', 'methodology', ['unknown_code']))).toBeNull();
        expect(
            badgeCallTypesText(badge('m', 'methodology', ['unknown_code', 'cold'])),
        ).toBe('Типы звонков: Холодный');
    });
});

describe('splitBadgesByCallTypes — разбивка бейджей методики по типам звонков', () => {
    it('бейджи с одним типом стоят вместе под названием типа', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('cold-1', 'methodology', ['cold']),
            badge('show-1', 'methodology', ['presentation']),
            badge('cold-2', 'methodology', ['cold']),
        ]);
        expect(subgroups.map(item => item.title)).toEqual(['Холодный', 'Презентация']);
        expect(subgroups[0]?.badges.map(item => item.id)).toEqual(['cold-1', 'cold-2']);
        expect(subgroups[1]?.badges.map(item => item.id)).toEqual(['show-1']);
    });

    it('подгруппы идут в порядке первого своего бейджа', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'methodology', ['presentation']),
            badge('b', 'methodology', ['cold']),
            badge('c', 'methodology', ['presentation']),
        ]);
        expect(subgroups.map(item => item.key)).toEqual(['presentation', 'cold']);
    });

    it('несколько типов — своя подгруппа, названия в порядке справочника', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'methodology', ['decision', 'refine']),
            badge('b', 'methodology', ['refine', 'decision']),
            badge('c', 'methodology', ['refine']),
            badge('d', 'methodology', ['cold']),
        ]);
        expect(subgroups.map(item => item.title)).toEqual([
            'Доработка, Решение',
            'Доработка',
            'Холодный',
        ]);
        expect(subgroups[0]?.badges.map(item => item.id)).toEqual(['a', 'b']);
        expect(subgroups[0]?.key).toBe('refine+decision');
    });

    it('бейджи без типа — одна подгруппа без подзаголовка', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'general'),
            badge('b', 'general'),
        ]);
        expect(subgroups).toHaveLength(1);
        expect(subgroups[0]?.title).toBeNull();
        expect(subgroups[0]?.badges.map(item => item.id)).toEqual(['a', 'b']);
    });

    it('незнакомый код типа не показывается и подгруппу не создаёт', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'methodology', ['unknown_code']),
            badge('b', 'methodology', ['unknown_code', 'cold']),
            badge('c', 'methodology', ['cold']),
        ]);
        expect(subgroups.map(item => item.title)).toEqual([null, 'Холодный']);
        expect(subgroups[1]?.badges.map(item => item.id)).toEqual(['b', 'c']);
    });

    it('повтор типа у бейджа не меняет подгруппу', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'methodology', ['cold', 'cold']),
            badge('b', 'methodology', ['cold']),
        ]);
        expect(subgroups).toHaveLength(1);
        expect(subgroups[0]?.title).toBe('Холодный');
    });

    it('ни один бейдж не теряется и не дублируется', () => {
        const badges = [
            badge('a', 'methodology', ['cold']),
            badge('b', 'methodology', []),
            badge('c', 'methodology', ['call', 'presentation']),
            badge('d', 'methodology', ['cold']),
        ];
        const ids = splitBadgesByCallTypes(badges).flatMap(item =>
            item.badges.map(one => one.id),
        );
        expect([...ids].sort()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('нет бейджей — нет подгрупп', () => {
        expect(splitBadgesByCallTypes([])).toEqual([]);
    });

    it('бейдж для всех типов группы подписан «Все типы звонков методики»', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('summary', 'methodology', ['cold', 'presentation', 'refine']),
            badge('a', 'methodology', ['cold']),
            badge('b', 'methodology', ['presentation', 'refine']),
        ]);
        expect(subgroups.map(item => item.title)).toEqual([
            'Все типы звонков методики',
            'Холодный',
            'Презентация, Доработка',
        ]);
        expect(subgroups[0]?.callTypes).toEqual(['cold', 'presentation', 'refine']);
    });

    it('единственная подгруппа из нескольких типов остаётся с перечнем названий', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'methodology', ['refine', 'decision']),
            badge('b', 'methodology', ['decision', 'refine']),
        ]);
        expect(subgroups.map(item => item.title)).toEqual(['Доработка, Решение']);
    });

    it('набор из нескольких типов, но не всех, подписан перечнем', () => {
        const subgroups = splitBadgesByCallTypes([
            badge('a', 'methodology', ['cold']),
            badge('b', 'methodology', ['refine', 'decision']),
            badge('c', 'methodology', ['payment']),
        ]);
        expect(subgroups.map(item => item.title)).toEqual([
            'Холодный',
            'Доработка, Решение',
            'Оплата',
        ]);
    });
});
