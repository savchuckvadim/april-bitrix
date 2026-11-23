import type { RootState } from '@/modules/app/model/store';
import type { ComplectVariantItem } from '../../../complect-variant/lib/api/complect-variant-helper';
import type { WordTemplateSummary } from '../../../offer-template-word/types/word-template-types';
import {
    complectVariantActions,
    complectVariantReducer,
} from '../../../complect-variant/model/ComplectVariantSlice';
import {
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { rootStateWith } from '../../../document-payload/lib/__fixtures__/root-state';
import { compositionOf, garantRowOf, syncedGeneral } from '../../../document-payload/lib/__fixtures__/two-garant-set';
import type { RowSet } from '../../../row-set';

/** Общий набор из одной главной строки комплекта «Бухгалтер». */
export const oneGarantGeneral = (): RowSet =>
    syncedGeneral([garantRowOf('general_main', 'main', 'buh', compositionOf('buh'))]);

/** Общий набор из двух комплектов с наполнением: главный «Бухгалтер» и дополнительный «Юрист». */
export const twoGarantGeneral = (): RowSet =>
    syncedGeneral([
        garantRowOf('general_main', 'main', 'buh', compositionOf('buh')),
        garantRowOf('general_additional', 'additional', 'ur', compositionOf('ur')),
    ]);

/** Режим сборки и открытый вариант сделки в тестовом состоянии. */
export interface VariantsStateOptions {
    /** Режим сделки; без него настройки сделки не заданы (по умолчанию «по одному») */
    mode?: ComplectMode;
    /** Открытый вариант: его живое состояние печатается вместо слепка */
    openVariantSmartId?: number | null;
}

/**
 * Состояние приложения с вариантами сделки: слепки и элементы смарта загружены,
 * общий набор из главной строки комплекта «Бухгалтер» (или заданный третьим
 * аргументом). Стадии берутся из `stageId` элементов. Режим и открытый вариант
 * задаёт четвёртый аргумент: без него действует «по одному» без открытого
 * варианта, и участников нет.
 * Файл тянет весь стор, поэтому подключается только тестами, которым нужен RootState.
 */
export const rootStateWithVariants = (
    records: ComplectVariantRecordDto[],
    items: ComplectVariantItem[],
    general: RowSet = oneGarantGeneral(),
    options: VariantsStateOptions = {},
): RootState => {
    const base = rootStateWith(general);
    const composition = options.mode ? { ...DEFAULT_COMPLECT_COMPOSITION, mode: options.mode } : null;
    let complectVariant = complectVariantReducer(
        base.complectVariant,
        complectVariantActions.loaded({ records, composition }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.itemsLoaded(items));
    if (options.openVariantSmartId !== undefined) {
        complectVariant = complectVariantReducer(
            complectVariant,
            complectVariantActions.setOpenVariant(options.openVariantSmartId),
        );
    }
    return { ...base, complectVariant };
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
