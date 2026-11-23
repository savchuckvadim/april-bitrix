import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/modules/app/model/store';
import {
    COMPLECT_MODE,
    COMPLECT_MODE_NOTE,
    COMPLECT_MODE_ORDER,
    COMPLECT_MODE_TITLE,
    getVariantContractCode,
    isSingleContractAllowed,
    selectComplectMode,
    selectUnclosedVariants,
    selectVariantStageOf,
    selectVariantStagesLoading,
    selectVariantsBusy,
    type ComplectMode,
} from '@/modules/entities/complect-variant';

/** Заголовок поля выбора режима на экранах договора и отчёта о поставке. */
export const COMPLECT_MODE_FIELD_TITLE = 'Варианты в договоре и отчёте';

/** Строка под выбором: КП от режима не зависит. */
export const COMPLECT_MODE_OFFER_NOTE = 'КП формируется по открытому варианту при любом выборе.';

/** Причина, по которой пункт «Все варианты одним договором» отключён. */
export const SINGLE_CONTRACT_UNAVAILABLE_TEXT =
    '«Все варианты одним договором» недоступно: у вариантов разные типы договора. ' +
    'Приведите их к одному типу или выберите другой режим.';

/** Сохранён режим «Все варианты одним договором», но типы договора у вариантов уже разошлись. */
export const SINGLE_CONTRACT_DIVERGED_TEXT =
    'Выбран один договор на все варианты, но типы договора у вариантов разошлись. ' +
    'Выберите режим заново.';

/** Выбор показывается, когда незакрытых вариантов два и больше: при одном выбирать нечего. */
export const MIN_VARIANTS_FOR_MODE_CHOICE = 2;

export interface ComplectModeOption {
    mode: ComplectMode;
    title: string;
    /** Пункт недоступен: «Все варианты одним договором» требует одного типа договора у всех вариантов. */
    disabled: boolean;
}

export interface ComplectModeView {
    /** Выбор виден: стадии загружены и незакрытых вариантов два и больше. */
    isVisible: boolean;
    mode: ComplectMode;
    options: ComplectModeOption[];
    /** Что идёт в договор и отчёт при выбранном режиме. */
    note: string;
    /** Причина отключённого пункта «Все варианты одним договором»; null, пока он доступен. */
    singleContractUnavailable: string | null;
    /** Выбран «Все варианты одним договором», но типы договора разошлись; иначе null. */
    singleContractDiverged: string | null;
    /** Идёт запись или загрузка вариантов: выбор заблокирован. */
    isBusy: boolean;
}

/** Пункты выбора в порядке экрана; «Все варианты одним договором» отключён, когда типы договора разные. */
export const buildComplectModeOptions = (singleContractAllowed: boolean): ComplectModeOption[] =>
    COMPLECT_MODE_ORDER.map(mode => ({
        mode,
        title: COMPLECT_MODE_TITLE[mode],
        disabled: mode === COMPLECT_MODE.single_contract && !singleContractAllowed,
    }));

/** Значение селекта → режим; чужое значение режимом не считается. */
export const parseComplectMode = (value: string): ComplectMode | null =>
    COMPLECT_MODE_ORDER.find(mode => mode === value) ?? null;

type VariantsState = Pick<RootState, 'complectVariant'>;

/**
 * Что показывает выбор режима. Незакрытые варианты считаются по стадиям
 * элементов: пока стадии грузятся, их число неизвестно, и выбор скрыт.
 * «Одним договором» оценивается по всем незакрытым вариантам: именно они пойдут
 * в договор и отчёт, как только выбран режим «Все варианты».
 */
export const selectComplectModeView = createSelector(
    [
        (state: VariantsState) => state.complectVariant.records,
        selectVariantStageOf,
        selectComplectMode,
        selectVariantStagesLoading,
        selectVariantsBusy,
    ],
    (records, stageOf, mode, stagesLoading, isBusy): ComplectModeView => {
        const unclosed = selectUnclosedVariants(records, stageOf);
        const singleContractAllowed = isSingleContractAllowed(unclosed.map(getVariantContractCode));
        return {
            isVisible: !stagesLoading && unclosed.length >= MIN_VARIANTS_FOR_MODE_CHOICE,
            mode,
            options: buildComplectModeOptions(singleContractAllowed),
            note: COMPLECT_MODE_NOTE[mode],
            singleContractUnavailable: singleContractAllowed ? null : SINGLE_CONTRACT_UNAVAILABLE_TEXT,
            singleContractDiverged:
                mode === COMPLECT_MODE.single_contract && !singleContractAllowed
                    ? SINGLE_CONTRACT_DIVERGED_TEXT
                    : null,
            isBusy,
        };
    },
);
