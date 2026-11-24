import { describe, expect, it } from 'vitest';
import { RQ_TYPE } from '@/modules/entities/bx-rq/model/types';
import { buildClientTypeOptions } from '../client-type-options.util';
import {
    isClientTypeDetectReady,
    isClientTypePromptVisible,
    type ClientTypePromptInput,
} from '../client-type-prompt.util';

const shown: ClientTypePromptInput = {
    detectDone: true,
    deferred: false,
    hasField: true,
    clientType: null,
};

describe('isClientTypePromptVisible', () => {
    it('всё загружено, тип неизвестен — окно нужно', () => {
        expect(isClientTypePromptVisible(shown)).toBe(true);
    });

    it('данные ещё грузятся или автоопределение не завершилось — окна нет', () => {
        expect(isClientTypePromptVisible({ ...shown, detectDone: false })).toBe(
            false,
        );
    });

    it('тип известен — окна нет', () => {
        expect(
            isClientTypePromptVisible({ ...shown, clientType: RQ_TYPE.IP }),
        ).toBe(false);
        expect(
            isClientTypePromptVisible({
                ...shown,
                clientType: RQ_TYPE.ORGANIZATION,
            }),
        ).toBe(false);
    });

    it('поля нет на портале — окна нет', () => {
        expect(isClientTypePromptVisible({ ...shown, hasField: false })).toBe(
            false,
        );
    });

    it('«Позже» скрывает окно', () => {
        expect(isClientTypePromptVisible({ ...shown, deferred: true })).toBe(
            false,
        );
    });
});

describe('isClientTypeDetectReady', () => {
    const ready = { hasCompany: true, portalLoaded: true, rqSettled: true };

    it('компания, портал и реквизиты на месте — готово', () => {
        expect(isClientTypeDetectReady(ready)).toBe(true);
    });

    it.each([
        ['нет компании', { ...ready, hasCompany: false }],
        ['портал не загружен', { ...ready, portalLoaded: false }],
        ['реквизиты не загружены', { ...ready, rqSettled: false }],
    ])('%s — рано', (_name, input) => {
        expect(isClientTypeDetectReady(input)).toBe(false);
    });
});

describe('buildClientTypeOptions', () => {
    const portalItems = ['commerc', 'state', 'ip', 'fiz', 'layer'].map(
        code => ({ code }),
    );

    it('все пять пунктов на портале — пять вариантов с подписями окна', () => {
        expect(buildClientTypeOptions(portalItems)).toEqual([
            { code: 'commerc', label: 'Коммерческие' },
            { code: 'state', label: 'Бюджетники' },
            { code: 'ip', label: 'ИП' },
            { code: 'fiz', label: 'Физ. лицо' },
            { code: 'layer', label: 'Адвокаты' },
        ]);
    });

    it('на портале пунктов меньше — только те, что есть, в порядке окна', () => {
        const options = buildClientTypeOptions([
            { code: 'ip' },
            { code: 'commerc' },
        ]);
        expect(options.map(option => option.code)).toEqual(['commerc', 'ip']);
    });

    it('неизвестные пункты пропускаются, пустое поле даёт пустой список', () => {
        expect(buildClientTypeOptions([{ code: 'other' }]).length).toBe(0);
        expect(buildClientTypeOptions([])).toEqual([]);
        expect(buildClientTypeOptions(undefined)).toEqual([]);
    });
});
