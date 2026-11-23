'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    contractDocumentActions,
    contractGenerateBlocker,
    generateContractUnit,
    initialContractGenerate,
    selectContractUnitState,
    type ContractUnit,
} from '@/modules/entities/contract-document';

const IDLE_GENERATE = initialContractGenerate();

/**
 * Карточка договорной единицы: номер договора, состояние формирования и
 * кнопка «Сформировать» только для этого варианта. Во фрейме окно остаётся на
 * месте: договоры других вариантов менеджер формирует следом, ссылка на готовый
 * лежит в карточке.
 */
export const useContractUnit = (unit: ContractUnit) => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(current => selectContractUnitState(current, unit.key));
    const blocker = useAppSelector(contractGenerateBlocker);
    const isAppBusy = useAppSelector(current => current.app.busy !== null);
    const generate = state?.generate ?? IDLE_GENERATE;
    const isGenerating = generate.status === 'generating';

    return {
        contractNumber: state?.contractNumber ?? '',
        setContractNumber: (value: string) =>
            dispatch(contractDocumentActions.unitContractNumber({ key: unit.key, value })),
        blocker,
        isGenerating,
        isDone: generate.status === 'done',
        // пока форма единицы грузится, спецификации в ней ещё нет
        isDisabled: Boolean(blocker) || isGenerating || isAppBusy || state?.formStatus === 'loading',
        error: generate.status === 'error' ? generate.error : null,
        link: generate.link,
        documentName: generate.documentName,
        savedToDisk: generate.savedToDisk,
        run: () => void dispatch(generateContractUnit(unit.key)),
    };
};
