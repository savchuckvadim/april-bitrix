import { describe, expect, it } from 'vitest';
import {
    BIND_AGENT_REQUIRED,
    BIND_MODE_UNAVAILABLE,
    availableBindModes,
    bindModeOfTemplate,
    bindModeToScope,
    bindingLabelOf,
    canStartCreate,
    defaultBindMode,
    providerNameOf,
    validateBindMode,
    type BindModeAccess,
} from '../invoice-template-bind-mode.util';
import type { InvoiceTemplateQuota } from '../invoice-template-quota.util';
import { makeTemplate } from './fixtures';

const ROOM: InvoiceTemplateQuota = { count: 0, max: 2, canCreate: true };
const FULL: InvoiceTemplateQuota = { count: 2, max: 2, canCreate: false };

const access = (patch: Partial<BindModeAccess> = {}): BindModeAccess => ({
    isSuperUser: false,
    portalId: 7,
    providerCount: 1,
    quota: ROOM,
    editing: null,
    ...patch,
});

describe('availableBindModes', () => {
    it('рядовой пользователь: портал и поставщик, общего нет', () => {
        expect(availableBindModes(access())).toEqual(['portal', 'provider']);
    });

    it('суперпользователь видит ещё и общий', () => {
        expect(availableBindModes(access({ isSuperUser: true }))).toEqual([
            'portal',
            'provider',
            'public',
        ]);
    });

    it('без поставщиков режима «поставщик» нет', () => {
        expect(availableBindModes(access({ providerCount: 0 }))).toEqual([
            'portal',
        ]);
    });

    it('квота исчерпана: рядовому нечего выбирать, суперпользователю остаётся общий', () => {
        expect(availableBindModes(access({ quota: FULL }))).toEqual([]);
        expect(
            availableBindModes(access({ quota: FULL, isSuperUser: true })),
        ).toEqual(['public']);
    });

    it('нет портала: портальных режимов нет', () => {
        expect(availableBindModes(access({ portalId: null }))).toEqual([]);
        expect(
            availableBindModes(access({ portalId: null, isSuperUser: true })),
        ).toEqual(['public']);
    });

    it('правка шаблона портала не занимает место в квоте: режимы остаются при полной квоте', () => {
        const editing = makeTemplate({ visibility: 'portal' });

        expect(availableBindModes(access({ quota: FULL, editing }))).toEqual([
            'portal',
            'provider',
        ]);
    });

    it('перевод общего шаблона в портальный требует места в квоте', () => {
        const editing = makeTemplate({
            visibility: 'public',
            portalId: null,
        });

        expect(
            availableBindModes(
                access({ quota: FULL, editing, isSuperUser: true }),
            ),
        ).toEqual(['public']);
        expect(
            availableBindModes(
                access({ quota: ROOM, editing, isSuperUser: true }),
            ),
        ).toEqual(['portal', 'provider', 'public']);
    });
});

describe('defaultBindMode и canStartCreate', () => {
    it('по умолчанию первый доступный режим: портал', () => {
        expect(defaultBindMode(access())).toBe('portal');
    });

    it('квота исчерпана у суперпользователя: по умолчанию общий', () => {
        expect(defaultBindMode(access({ quota: FULL, isSuperUser: true }))).toBe(
            'public',
        );
    });

    it('нечего выбрать: по умолчанию null, создавать нельзя', () => {
        expect(defaultBindMode(access({ quota: FULL }))).toBeNull();
        expect(canStartCreate(access({ quota: FULL }))).toBe(false);
    });

    it('создание доступно с местом в квоте и суперпользователю', () => {
        expect(canStartCreate(access())).toBe(true);
        expect(canStartCreate(access({ quota: FULL, isSuperUser: true }))).toBe(
            true,
        );
    });

    it('создание не смотрит на правимый шаблон', () => {
        expect(
            canStartCreate(
                access({ quota: FULL, editing: makeTemplate({ id: 'x' }) }),
            ),
        ).toBe(false);
    });
});

describe('validateBindMode', () => {
    const all = ['portal', 'provider', 'public'] as const;

    it('портал: поставщик не нужен', () => {
        expect(validateBindMode('portal', null, all)).toEqual({});
    });

    it('поставщик без выбранного поставщика: ошибка поля agentId', () => {
        expect(validateBindMode('provider', null, all)).toEqual({
            agentId: BIND_AGENT_REQUIRED,
        });
    });

    it('недоступный режим: ошибка режима', () => {
        expect(validateBindMode('public', null, ['portal'])).toEqual({
            bindMode: BIND_MODE_UNAVAILABLE,
        });
    });
});

describe('bindModeToScope: зеркало бэка', () => {
    it('общий: ни портала, ни поставщика', () => {
        expect(bindModeToScope('public', 7, '3')).toEqual({
            visibility: 'public',
            portalId: null,
            agentId: null,
        });
    });

    it('портал: портал без поставщика, id строкой', () => {
        expect(bindModeToScope('portal', 7, '3')).toEqual({
            visibility: 'portal',
            portalId: '7',
            agentId: null,
        });
    });

    it('поставщик: портал и поставщик', () => {
        expect(bindModeToScope('provider', 7, '3')).toEqual({
            visibility: 'provider',
            portalId: '7',
            agentId: '3',
        });
    });

    it('нет портала: portalId null', () => {
        expect(bindModeToScope('portal', null, null).portalId).toBeNull();
    });
});

describe('подписи привязки', () => {
    const providers = [{ id: '3', name: ' ООО Гарант ' }];

    it('режим шаблона совпадает с видимостью', () => {
        expect(bindModeOfTemplate(makeTemplate({ visibility: 'public' }))).toBe(
            'public',
        );
    });

    it('название поставщика: из списка, иначе «Поставщик №id»', () => {
        expect(providerNameOf(providers, '3')).toBe('ООО Гарант');
        expect(providerNameOf(providers, '9')).toBe('Поставщик №9');
        expect(providerNameOf(providers, null)).toBeNull();
    });

    it('привязка в таблице: общий, портал, имя поставщика', () => {
        expect(
            bindingLabelOf(makeTemplate({ visibility: 'public' }), providers),
        ).toBe('Общий');
        expect(
            bindingLabelOf(makeTemplate({ visibility: 'portal' }), providers),
        ).toBe('Портал');
        expect(
            bindingLabelOf(
                makeTemplate({ visibility: 'provider', agentId: '3' }),
                providers,
            ),
        ).toBe('ООО Гарант');
    });

    it('поставщик не назван в шаблоне: общая подпись «Поставщик»', () => {
        expect(
            bindingLabelOf(
                makeTemplate({ visibility: 'provider', agentId: null }),
                providers,
            ),
        ).toBe('Поставщик');
    });
});
