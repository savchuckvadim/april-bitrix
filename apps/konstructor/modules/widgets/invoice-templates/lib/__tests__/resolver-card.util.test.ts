import { describe, expect, it } from 'vitest';
import type {
    InvoiceTemplate,
    ResolvedInvoiceState,
} from '@/modules/entities/invoice-template';
import {
    MISSING_TEMPLATE_DETAILS,
    resolverCardView,
} from '../resolver-card.util';

const template = (patch: Partial<InvoiceTemplate> = {}): InvoiceTemplate => ({
    id: 'uuid-1',
    name: 'Счёт ИП',
    description: null,
    visibility: 'portal',
    portalId: '7',
    agentId: null,
    clientTypes: null,
    supplyTypes: null,
    isDefault: false,
    isActive: true,
    isArchived: false,
    updatedAt: null,
    ...patch,
});

const ready = (templateId: string | null): ResolvedInvoiceState => ({
    status: 'ready',
    value: { source: 'db', templateId, reason: 'Подобран по: портал' },
    error: null,
});

describe('resolverCardView', () => {
    it('нет признаков: подбор недоступен', () => {
        const view = resolverCardView(
            { status: 'idle', value: null, error: null },
            [],
        );

        expect(view.kind).toBe('idle');
    });

    it('первая загрузка: «Подбираем шаблон»', () => {
        const view = resolverCardView(
            { status: 'loading', value: null, error: null },
            [],
        );

        expect(view).toMatchObject({ kind: 'loading', template: null });
    });

    it('повторный запрос: прежний ответ остаётся на экране', () => {
        const state: ResolvedInvoiceState = {
            ...ready('uuid-1'),
            status: 'loading',
        };

        expect(resolverCardView(state, [template()]).kind).toBe('found');
    });

    it('шаблон найден: заголовок с названием, причина от бэка', () => {
        const view = resolverCardView(ready('uuid-1'), [template()]);

        expect(view).toMatchObject({
            kind: 'found',
            title: 'Сейчас уйдёт шаблон: «Счёт ИП»',
            details: 'Подобран по: портал',
        });
        expect(view.template?.id).toBe('uuid-1');
    });

    it('шаблона нет в загруженном списке: показывается номер', () => {
        const view = resolverCardView(ready('uuid-9'), [template()]);

        expect(view.title).toBe('Сейчас уйдёт шаблон: «№uuid-9»');
        expect(view.template).toBeNull();
    });

    it('подходящего шаблона нет: предупреждение с подсказкой, что делать', () => {
        const view = resolverCardView(ready(null), [template()]);

        expect(view).toMatchObject({
            kind: 'missing',
            title: 'Подходящего шаблона нет',
            details: MISSING_TEMPLATE_DETAILS,
        });
    });

    it('ошибка запроса: текст ошибки в пояснении', () => {
        const view = resolverCardView(
            { status: 'error', value: null, error: 'Сеть недоступна' },
            [],
        );

        expect(view).toMatchObject({
            kind: 'error',
            details: 'Сеть недоступна',
        });
    });
});
