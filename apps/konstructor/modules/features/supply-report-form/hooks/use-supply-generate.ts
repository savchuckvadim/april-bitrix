'use client';

import { getCrmUrl } from '@workspace/bitrix';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { IS_PROD } from '@/modules/app/consts/app-global';
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
    const domain = useAppSelector(state => state.app.domain);
    const dealId = useAppSelector(state => state.app.dealId);

    const run = async () => {
        const ok = await dispatch(generateSupplyReport());
        if (!ok || !IS_PROD) return ok;
        const url = getCrmUrl(domain, 'deal', dealId);
        if (url) (window.top ?? window).location.replace(url);
        return ok;
    };

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
