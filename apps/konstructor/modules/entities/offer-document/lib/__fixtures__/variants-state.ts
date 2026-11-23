import type { RootState } from '@/modules/app/model/store';
import type { ComplectVariantItem } from '../../../complect-variant/lib/api/complect-variant-helper';
import type { WordTemplateSummary } from '../../../offer-template-word/types/word-template-types';
import {
    complectVariantActions,
    complectVariantReducer,
} from '../../../complect-variant/model/ComplectVariantSlice';
import type { ComplectVariantRecordDto } from '../../../complect-variant/model/dto';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { compositionOf, garantRowOf, syncedGeneral } from '../../../document-payload/lib/__fixtures__/two-garant-set';

/**
 * Состояние приложения с вариантами сделки: слепки и элементы смарта загружены,
 * общий набор из главной строки комплекта «Бухгалтер». Стадии берутся из `stageId` элементов.
 * Файл тянет весь стор, поэтому подключается только тестами, которым нужен RootState.
 */
export const rootStateWithVariants = (
    records: ComplectVariantRecordDto[],
    items: ComplectVariantItem[],
): RootState => {
    const base = rootStateWith(
        syncedGeneral([garantRowOf('general_main', 'main', 'buh', compositionOf('buh'))]),
    );
    const loaded = complectVariantReducer(
        base.complectVariant,
        complectVariantActions.loaded({ records, composition: null }),
    );
    return {
        ...base,
        complectVariant: complectVariantReducer(loaded, complectVariantActions.itemsLoaded(items)),
    };
};

/** Выбранный Word-шаблон КП: без него КП в Word блокируется раньше проверки вариантов. */
export const offerWordTemplate: WordTemplateSummary = {
    id: '1',
    name: 'КП',
    visibility: 'public',
    is_default: true,
    type: 'offer',
    code: 'offer',
    is_active: true,
    counter: 0,
};

/** Состояние с вариантами и выбранным Word-шаблоном. */
export const rootStateWithVariantsAndTemplate = (
    ...args: Parameters<typeof rootStateWithVariants>
): RootState => {
    const base = rootStateWithVariants(...args);
    return { ...base, offerTemplateWord: { ...base.offerTemplateWord, selectedTemplate: offerWordTemplate } };
};
