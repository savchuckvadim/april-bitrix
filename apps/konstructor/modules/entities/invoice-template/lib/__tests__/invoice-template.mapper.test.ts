import { describe, expect, it } from 'vitest';
import type { InvoiceTemplateDto } from '../../model';
import {
    toCodeList,
    toInvoiceTemplate,
    toResolvedInvoiceTemplate,
} from '../invoice-template.mapper';
import { INVOICE_CLIENT_TYPE_CODES } from '../invoice-template-criteria.util';

/** Ответ бэка: nullable-поля в сгенерированном типе потеряны, поэтому через unknown. */
const dto = (patch: Record<string, unknown> = {}): InvoiceTemplateDto =>
    ({
        id: 'uuid-1',
        name: 'Счёт',
        visibility: 'provider',
        type: 'word',
        code: 'invoice-1',
        description: null,
        client_types: null,
        supply_types: null,
        counter: 0,
        is_default: true,
        is_active: true,
        is_archived: false,
        archived_at: null,
        portal_id: '7',
        agent_id: '3',
        creator_bitrix_user_id: null,
        created_at: null,
        updated_at: '2026-11-27T10:00:00.000Z',
        ...patch,
    }) as unknown as InvoiceTemplateDto;

describe('toCodeList', () => {
    it('оставляет известные коды в каноническом порядке, без повторов', () => {
        expect(
            toCodeList(['ip', 'org', 'ip'], INVOICE_CLIENT_TYPE_CODES),
        ).toEqual(['org', 'ip']);
    });

    it('пустое, не массив и одни незнакомые коды дают null: «подходит любому»', () => {
        expect(toCodeList([], INVOICE_CLIENT_TYPE_CODES)).toBeNull();
        expect(toCodeList(null, INVOICE_CLIENT_TYPE_CODES)).toBeNull();
        expect(toCodeList('ip', INVOICE_CLIENT_TYPE_CODES)).toBeNull();
        expect(toCodeList(['cloud'], INVOICE_CLIENT_TYPE_CODES)).toBeNull();
    });
});

describe('toInvoiceTemplate', () => {
    it('переводит поля в доменную модель', () => {
        expect(toInvoiceTemplate(dto())).toEqual({
            id: 'uuid-1',
            name: 'Счёт',
            description: null,
            visibility: 'provider',
            portalId: '7',
            agentId: '3',
            clientTypes: null,
            supplyTypes: null,
            isDefault: true,
            isActive: true,
            isArchived: false,
            updatedAt: '2026-11-27T10:00:00.000Z',
        });
    });

    it('списки критериев переводятся, нет ограничения значит null', () => {
        const mapped = toInvoiceTemplate(
            dto({ client_types: ['org', 'ip'], supply_types: ['internet'] }),
        );

        expect(mapped.clientTypes).toEqual(['org', 'ip']);
        expect(mapped.supplyTypes).toEqual(['internet']);
    });

    it('общий шаблон: портал и поставщик null, описание пустое значит null', () => {
        const mapped = toInvoiceTemplate(
            dto({
                visibility: 'public',
                portal_id: null,
                agent_id: '',
                description: '',
            }),
        );

        expect(mapped.portalId).toBeNull();
        expect(mapped.agentId).toBeNull();
        expect(mapped.description).toBeNull();
    });

    it('числовой id портала приводится к строке', () => {
        expect(toInvoiceTemplate(dto({ portal_id: 7 })).portalId).toBe('7');
    });
});

describe('toResolvedInvoiceTemplate', () => {
    it('шаблон найден: id и причина', () => {
        expect(
            toResolvedInvoiceTemplate({
                source: 'db',
                templateId: 'uuid-1',
                reason: 'Подобран по: портал',
                criteria: {} as never,
            }),
        ).toEqual({
            source: 'db',
            templateId: 'uuid-1',
            reason: 'Подобран по: портал',
        });
    });

    it('подходящего шаблона нет: templateId null', () => {
        expect(
            toResolvedInvoiceTemplate({
                source: 'db',
                templateId: null,
                reason: 'нет',
                criteria: {} as never,
            }).templateId,
        ).toBeNull();
    });
});
