'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { runDocumentToDeal } from '@/modules/app/model/document-run.thunk';
import {
    generateSupplyReport,
    selectSupplyGenerate,
    selectSupplyNeedProcess,
    selectSupplyRpaId,
    supplyReportActions,
    supplyReportBlocker,
    supplyReportValidationErrors,
} from '@/modules/entities/supply-report-document';

/**
 * «Сформировать отчёт»: generate-document (+ init-supply, если включён
 * процесс поставки), затем в Битриксе — уход в сделку; вне — ссылка на DOCX.
 */
export const useSupplyGenerate = () => {
    const dispatch = useAppDispatch();
    const generate = useAppSelector(selectSupplyGenerate);
    const blocker = useAppSelector(supplyReportBlocker);
    const errors = useAppSelector(supplyReportValidationErrors);
    const needProcess = useAppSelector(selectSupplyNeedProcess);
    const rpaId = useAppSelector(selectSupplyRpaId);

    // экран загрузки на всё время, повторное нажатие не запускает второй документ
    const run = () =>
        dispatch(runDocumentToDeal('Формирую отчёт о поставке…', () => dispatch(generateSupplyReport())));

    return {
        blocker,
        missing: errors,
        needProcess,
        setNeedProcess: (value: boolean) => dispatch(supplyReportActions.setNeedProcess(value)),
        // заявка уже есть — init-supply её обновит, а не заведёт вторую
        existingRpaId: rpaId,
        isGenerating: generate.status === 'generating',
        isDone: generate.status === 'done',
        error: generate.status === 'error' ? generate.error : null,
        link: generate.link,
        createdRpaId: generate.rpaId,
        run,
    };
};
