import { describe, expect, it } from 'vitest';
import type { BadgeCatalogDto } from '@workspace/nest-event-sales-api';
import { normalizeBadgeCatalog } from './badge-catalog-normalize';

const dto = (items: unknown[], mode = 'default'): BadgeCatalogDto =>
    ({ contract: 1, mode, version: 1, hash: 'h', items }) as unknown as BadgeCatalogDto;

/* Нераспознанное не показываем — но и не ломаем весь набор из-за одной записи. */
describe('normalizeBadgeCatalog', () => {
    it('узнаёт запись целиком и сортирует по sort', () => {
        const { items, warnings } = normalizeBadgeCatalog(
            dto([
                { code: 'b', text: 'Б', target: 'comment', tone: 'warning', outcomes: ['setAside'], planTypes: [], isDefault: false, sort: 20 },
                { code: 'a', text: 'А', target: 'title', tone: 'neutral', outcomes: [], planTypes: ['warm'], isDefault: true, sort: 10 },
            ]),
        );
        expect(warnings).toEqual([]);
        expect(items.map(i => i.code)).toEqual(['a', 'b']);
        expect(items[0]).toMatchObject({ target: 'title', isDefault: true, planTypes: ['warm'] });
    });

    it('неизвестная цель — запись выброшена; неизвестные итог/тип/цвет — отсеяны с предупреждением', () => {
        const { items, warnings } = normalizeBadgeCatalog(
            dto([
                { code: 'x', text: 'X', target: 'footer', tone: 'neutral', outcomes: [], planTypes: [] },
                { code: 'y', text: 'Y', target: 'comment', tone: 'pink', outcomes: ['fail', 'won'], planTypes: [] },
                { code: 'z', text: 'Z', target: 'title', tone: 'info', outcomes: [], planTypes: ['warm', 'alien'] },
            ]),
        );
        expect(items.map(i => i.code)).toEqual(['y', 'z']);
        expect(items[0]).toMatchObject({ tone: 'neutral', outcomes: ['fail'] });
        expect(items[1]).toMatchObject({ planTypes: ['warm'] });
        expect(warnings).toHaveLength(4);
    });

    it('режим own узнаётся, всё прочее — default', () => {
        expect(normalizeBadgeCatalog(dto([], 'own')).mode).toBe('own');
        expect(normalizeBadgeCatalog(dto([], 'weird')).mode).toBe('default');
    });
});
