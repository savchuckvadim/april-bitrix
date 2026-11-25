import { describe, expect, it } from 'vitest';
import type { PortalViewBadgeOption } from '@/modules/feature/portal-view';
import { badgeCallTypesText, groupBadges } from '../report-settings-badges';

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
