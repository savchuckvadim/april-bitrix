import { describe, expect, it } from 'vitest';
import type { WordTemplateSummary } from '@/modules/entities/offer-template-word';
import {
    canManagePreview,
    canManageTemplate,
    filterShopTemplates,
    type TemplateShopViewer,
} from '../template-shop.util';

const template = (over: Partial<WordTemplateSummary>): WordTemplateSummary =>
    ({
        id: '1',
        name: 'Шаблон',
        visibility: 'public',
        is_default: false,
        is_active: true,
        type: 'offer',
        code: 'code',
        counter: 0,
        ...over,
    }) as WordTemplateSummary;

const viewer: TemplateShopViewer = { userId: 10, isSuperUser: false, favorites: ['3'], selectedId: '4' };

const list = [
    template({ id: '1', name: 'Простой', visibility: 'public' }),
    template({ id: '2', name: 'Мой шаблон', visibility: 'user', user_id: 10 }),
    template({ id: '3', name: 'Искра', visibility: 'public', tags: 'lt' }),
    template({ id: '4', name: 'Модерн', visibility: 'private' }),
    template({ id: '5', name: 'Архивный', is_archived: true }),
];

describe('filterShopTemplates', () => {
    it('выбранный первым, затем избранные, архивных нет', () => {
        expect(filterShopTemplates(list, 'all', '', viewer).map(item => item.id)).toEqual(['4', '3', '2', '1']);
    });

    it('вкладки: мои, избранные, портала, общедоступные', () => {
        expect(filterShopTemplates(list, 'mine', '', viewer).map(item => item.id)).toEqual(['2']);
        expect(filterShopTemplates(list, 'favorites', '', viewer).map(item => item.id)).toEqual(['3']);
        expect(filterShopTemplates(list, 'portal', '', viewer).map(item => item.id)).toEqual(['4']);
        expect(filterShopTemplates(list, 'public', '', viewer).map(item => item.id)).toEqual(['3', '1']);
    });

    it('поиск по названию и тегам', () => {
        expect(filterShopTemplates(list, 'all', 'LT', viewer).map(item => item.id)).toEqual(['3']);
        expect(filterShopTemplates(list, 'all', 'прост', viewer).map(item => item.id)).toEqual(['1']);
    });
});

describe('права', () => {
    it('общедоступный правит только суперпользователь', () => {
        expect(canManageTemplate(list[0]!, viewer)).toBe(false);
        expect(canManageTemplate(list[0]!, { ...viewer, isSuperUser: true })).toBe(true);
        expect(canManageTemplate(list[1]!, viewer)).toBe(true);
    });

    it('своё превью: суперпользователь — любому, автор — своему', () => {
        expect(canManagePreview(list[0]!, viewer)).toBe(false);
        expect(canManagePreview(list[1]!, viewer)).toBe(true);
        expect(canManagePreview(list[0]!, { ...viewer, isSuperUser: true })).toBe(true);
    });
});
