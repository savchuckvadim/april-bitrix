import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import type { WordTemplateSummary } from '../../../offer-template-word/types/word-template-types';
import { createSet } from '../../../row-set';
import { buildOfferGenerateRequest, buildOfferMultiGenerateRequest, offerRequestBlocker } from '../build-offer-request';
import { selectVariantsPayload } from '../select-variants-payload';
import { skippedVariantsBlocker } from '../skipped-variants-blocker';
import { recordOf, snapshotRowsOf, variantItems } from '../__fixtures__/variant-records';
import { rootStateWithVariants } from '../__fixtures__/variants-state';

const template: WordTemplateSummary = {
    id: '1',
    name: 'КП',
    visibility: 'public',
    is_default: true,
    type: 'offer',
    code: 'offer',
    is_active: true,
    counter: 0,
};

/** Состояние с выбранным Word-шаблоном: без него КП блокируется раньше проверки вариантов. */
const stateWith = (...args: Parameters<typeof rootStateWithVariants>): RootState => {
    const base = rootStateWithVariants(...args);
    return { ...base, offerTemplateWord: { ...base.offerTemplateWord, selectedTemplate: template } };
};

describe('КП: участники-варианты и блокер', () => {
    it('все участники собираются — блокера нет, варианты уходят в запрос', () => {
        const state = stateWith([recordOf(1, 102, 'buh'), recordOf(2, 104, 'ur')], variantItems);
        expect(offerRequestBlocker(state)).toBeNull();
        const request = buildOfferMultiGenerateRequest(state);
        expect(request?.variants.map(variant => variant.variantSmartId)).toEqual([102, 104]);
    });

    it('нечитаемый слепок участника блокирует КП и называет вариант', () => {
        const state = stateWith([recordOf(2, 102, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).toBe(
            'Вариант «Юристу» нельзя включить в документ: слепок не читается. ' +
                'Откройте вариант и сохраните его заново или отклоните его',
        );
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it('участник без главной строки блокирует КП с названием варианта', () => {
        const state = stateWith(
            [recordOf(1, 102, 'buh', snapshotRowsOf(createSet('general', 'general')))],
            variantItems,
        );
        const blocker = offerRequestBlocker(state);
        expect(blocker).toContain('Вариант «Юристу» нельзя включить в документ');
        expect(blocker).toContain('нет главной строки комплекта');
        expect(buildOfferMultiGenerateRequest(state)).toBeNull();
    });

    it('превью PDF собирается без проверки вариантов: в его запрос варианты не входят', () => {
        const state = stateWith([recordOf(1, 102, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).not.toBeNull();
        expect(buildOfferGenerateRequest(state)).not.toBeNull();
    });

    it('битый слепок варианта в финальной стадии не блокирует КП', () => {
        const state = stateWith([recordOf(1, 101, 'buh'), recordOf(3, 103, 'buh', '{broken')], variantItems);
        expect(offerRequestBlocker(state)).toBeNull();
    });

    it('пока стадии вариантов грузятся, блокер сообщает о загрузке', () => {
        const state = stateWith([recordOf(1, 102, 'buh', '{broken')], variantItems);
        const loading: RootState = {
            ...state,
            complectVariant: { ...state.complectVariant, itemsStatus: 'loading' },
        };
        expect(offerRequestBlocker(loading)).toBe('Варианты КП ещё загружаются');
    });

    it('selectVariantsPayload кэшируется: смена чужого среза стора даёт тот же объект', () => {
        const state = stateWith([recordOf(1, 102, 'buh')], variantItems);
        const other: RootState = { ...state, app: { ...state.app, dealId: 1 } };
        expect(selectVariantsPayload(other)).toBe(selectVariantsPayload(state));
    });
});

describe('skippedVariantsBlocker', () => {
    it('пропущенных нет — null', () => {
        expect(skippedVariantsBlocker([])).toBeNull();
    });

    it('несколько пропущенных: по предложению на вариант, причины у каждого свои', () => {
        const text = skippedVariantsBlocker([
            { variantSmartId: 1, title: 'А', reason: 'snapshotUnreadable' },
            { variantSmartId: 2, title: 'Б', reason: 'noMainRow' },
        ]);
        expect(text).toContain('Вариант «А» нельзя включить в документ: слепок не читается');
        expect(text).toContain('Вариант «Б» нельзя включить в документ: нет главной строки комплекта');
    });
});
