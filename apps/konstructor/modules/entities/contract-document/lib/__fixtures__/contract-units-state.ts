import type { RootState } from '@/modules/app/model/store';
import type { ComplectVariantItem } from '../../../complect-variant/lib/api/complect-variant-helper';
import { complectVariantActions, complectVariantReducer } from '../../../complect-variant/model/ComplectVariantSlice';
import {
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '../../../complect-variant/model/dto';
import { recordOf } from '../../../offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '../../../offer-document/lib/__fixtures__/variants-state';

/**
 * Состояние приложения для тестов договорных единиц. Живое состояние
 * (комплект «Бухгалтер») принадлежит открытому варианту, слепки вариантов
 * хранят комплект «Юрист». Файл тянет весь стор, поэтому подключается только
 * тестами, которым нужен RootState.
 */

export const OPEN_VARIANT_ID = 201;
export const OTHER_VARIANT_ID = 202;

/** Оба варианта — черновики: участвуют все нефинальные. Третий отклонён. */
export const unitItems: ComplectVariantItem[] = [
    { id: OPEN_VARIANT_ID, title: 'Бухгалтеру', stageId: 'DT1:NEW' },
    { id: OTHER_VARIANT_ID, title: 'Юристу', stageId: 'DT1:NEW' },
    { id: 203, title: 'Отклонённый', stageId: 'DT1:REJECTED' },
];

/** Записи двух участников: слепки комплекта «Юрист». */
export const twoVariantRecords = (): ComplectVariantRecordDto[] => [
    recordOf(1, OPEN_VARIANT_ID, 'ur'),
    recordOf(2, OTHER_VARIANT_ID, 'ur'),
];

/** Состояние с вариантами, режимом сборки и открытым вариантом. */
export const contractUnitsState = (
    mode: ComplectMode,
    records: ComplectVariantRecordDto[],
    openVariantSmartId: number | null = OPEN_VARIANT_ID,
): RootState => {
    const base = rootStateWithVariants(records, unitItems);
    let complectVariant = complectVariantReducer(
        base.complectVariant,
        complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.setOpenVariant(openVariantSmartId));
    return { ...base, complectVariant };
};
