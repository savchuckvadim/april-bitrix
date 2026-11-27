import { describe, expect, it } from 'vitest';
import {
    archivedCount,
    canManageInvoiceTemplate,
    mergeInvoiceTemplates,
    requestErrorText,
    sortInvoiceTemplates,
    visibleInvoiceTemplates,
} from '../invoice-template-list.util';
import { makeTemplate } from './fixtures';

describe('canManageInvoiceTemplate', () => {
    it('общий шаблон правит только суперпользователь', () => {
        const shared = makeTemplate({ visibility: 'public', portalId: null });

        expect(canManageInvoiceTemplate(shared, false)).toBe(false);
        expect(canManageInvoiceTemplate(shared, true)).toBe(true);
    });

    it('шаблоны портала и поставщика правит любой', () => {
        expect(canManageInvoiceTemplate(makeTemplate(), false)).toBe(true);
        expect(
            canManageInvoiceTemplate(
                makeTemplate({ visibility: 'provider' }),
                false,
            ),
        ).toBe(true);
    });
});

describe('mergeInvoiceTemplates', () => {
    it('повтор по id схлопывается, побеждает последний', () => {
        const merged = mergeInvoiceTemplates(
            [makeTemplate({ id: 'a', name: 'Старый' })],
            [
                makeTemplate({ id: 'a', name: 'Новый' }),
                makeTemplate({ id: 'b' }),
            ],
        );

        expect(merged.map(item => item.id)).toEqual(['a', 'b']);
        expect(merged[0]?.name).toBe('Новый');
    });
});

describe('sortInvoiceTemplates и visibleInvoiceTemplates', () => {
    const templates = [
        makeTemplate({ id: 'pub', name: 'Б', visibility: 'public' }),
        makeTemplate({ id: 'portal-b', name: 'Б', visibility: 'portal' }),
        makeTemplate({ id: 'old', name: 'А', isArchived: true }),
        makeTemplate({ id: 'provider', name: 'Я', visibility: 'provider' }),
        makeTemplate({ id: 'portal-a', name: 'А', visibility: 'portal' }),
    ];

    it('живые раньше архивных, привязка от точной к общей, затем название', () => {
        expect(sortInvoiceTemplates(templates).map(item => item.id)).toEqual([
            'provider',
            'portal-a',
            'portal-b',
            'pub',
            'old',
        ]);
    });

    it('исходный список не меняется', () => {
        const before = templates.map(item => item.id);
        sortInvoiceTemplates(templates);

        expect(templates.map(item => item.id)).toEqual(before);
    });

    it('архив скрыт, пока переключатель выключен', () => {
        const ids = visibleInvoiceTemplates(templates, false).map(
            item => item.id,
        );

        expect(ids).not.toContain('old');
        expect(visibleInvoiceTemplates(templates, true)).toHaveLength(5);
    });

    it('считает архивные', () => {
        expect(archivedCount(templates)).toBe(1);
    });
});

describe('requestErrorText', () => {
    it('сообщение бэка из ответа HTTP важнее сообщения ошибки', () => {
        const error = Object.assign(new Error('Request failed'), {
            response: { data: { message: 'Нужен файл шаблона (.docx)' } },
        });

        expect(requestErrorText(error, 'запасной')).toBe(
            'Нужен файл шаблона (.docx)',
        );
    });

    it('список сообщений валидации склеивается через запятую', () => {
        const error = { response: { data: { message: ['а', 'б'] } } };

        expect(requestErrorText(error, 'запасной')).toBe('а, б');
    });

    it('иначе сообщение ошибки, иначе запасной текст', () => {
        expect(requestErrorText(new Error('Сеть недоступна'), 'запасной')).toBe(
            'Сеть недоступна',
        );
        expect(requestErrorText('что-то', 'запасной')).toBe('запасной');
        expect(requestErrorText(null, 'запасной')).toBe('запасной');
    });
});
