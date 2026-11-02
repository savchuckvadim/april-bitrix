import { describe, expect, it } from 'vitest';
import type { MethodologyDetail } from '../model';
import {
    canSave,
    formFromDetail,
    formatUpdated,
    initialFormState,
    saveBlocker,
    toSaveBody,
} from './methodology-form.state';
import { emptyConfig } from './methodology-form.util';

const detail: MethodologyDetail = {
    id: 'b3f1c4e2-0000-4000-8000-000000000001',
    code: 'polyansky',
    title: 'Методика Полянского',
    version: '1.2.0',
    scope: 'common',
    portalDomain: null,
    source: 'table',
    isActive: true,
    updatedAt: '2026-11-01T10:00:00.000Z',
    updatedBy: 'vadim',
    valid: true,
    checkpoints: 2,
    caps: 0,
    config: {
        ...emptyConfig('polyansky', 'Методика Полянского'),
        version: '1.2.0',
        types: ['presentation'],
        principles: ['Сначала потребность'],
    },
    errors: [],
    versionTag: 'polyansky@1.2.0',
};

describe('methodology-form.state', () => {
    it('пустая форма: с порталом — своя методика, без — общая', () => {
        expect(initialFormState('gsr.bitrix24.ru')).toMatchObject({
            scope: 'portal',
            portalDomain: 'gsr.bitrix24.ru',
            isActive: true,
            dirty: false,
        });
        expect(initialFormState(undefined)).toMatchObject({ scope: 'common', portalDomain: null });
    });

    it('правка берёт строку как есть, копия — новая своя методика с суффиксом', () => {
        const edit = formFromDetail(detail, 'edit', 'gsr.bitrix24.ru');
        expect(edit).toMatchObject({ id: detail.id, scope: 'common', source: 'table', dirty: false });
        expect(edit.config).toBe(detail.config);

        const copy = formFromDetail(detail, 'copy', 'gsr.bitrix24.ru');
        expect(copy).toMatchObject({ id: null, scope: 'portal', portalDomain: 'gsr.bitrix24.ru', source: 'new', dirty: true });
        expect(copy.config).toMatchObject({
            code: 'polyansky-copy',
            title: 'Методика Полянского (копия)',
            version: '1.0.0',
            principles: ['Сначала потребность'],
        });
        expect(copy.config).not.toBe(detail.config);
    });

    it('тело сохранения не передаёт портал общему слою', () => {
        const state = { ...formFromDetail(detail, 'edit', undefined), portalDomain: 'x.bitrix24.ru' };
        expect(toSaveBody(state)).toMatchObject({ id: detail.id, scope: 'common', portalDomain: null, isActive: true });
        expect(toSaveBody({ ...state, scope: 'portal' }).portalDomain).toBe('x.bitrix24.ru');
    });

    it('сохранить можно только с кодом по шаблону, названием и порталом у своей', () => {
        const ok = formFromDetail(detail, 'edit', undefined);
        expect(canSave(ok)).toBe(true);
        expect(saveBlocker(ok)).toBeNull();
        expect(canSave({ ...ok, config: { ...ok.config, code: 'Bad Code' } })).toBe(false);
        expect(canSave({ ...ok, config: { ...ok.config, title: '  ' } })).toBe(false);
        const portalNoDomain = { ...ok, scope: 'portal' as const, portalDomain: null };
        expect(canSave(portalNoDomain)).toBe(false);
        expect(saveBlocker(portalNoDomain)).toBe('Для своей методики выберите портал над списком.');
    });

    it('дата правки: прочерк у встроенной, автор через запятую, мусор как есть', () => {
        expect(formatUpdated(null, null)).toBe('—');
        expect(formatUpdated('2026-11-01T10:00:00.000Z', 'vadim')).toMatch(/2026.*, vadim$/);
        expect(formatUpdated('not-a-date', null)).toBe('not-a-date');
    });
});
