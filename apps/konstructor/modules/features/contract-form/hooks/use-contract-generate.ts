'use client';

import { getCrmUrl } from '@workspace/bitrix';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { IS_PROD } from '@/modules/app/consts/app-global';
import {
    contractRequestBlocker,
    generateContract,
    selectContractGenerate,
} from '@/modules/entities/contract-document';

/**
 * «Сформировать договор»: contract/generate, затем в Битриксе — уход в
 * сделку (документ уже в таймлайне, легаси window.top.location.replace);
 * вне Битрикса — ссылка на DOCX прямо на экране. Незаполненное не блокирует:
 * пустые места договора бэк заполняет прочерками.
 */
export const useContractGenerate = () => {
    const dispatch = useAppDispatch();
    const generate = useAppSelector(selectContractGenerate);
    const blocker = useAppSelector(contractRequestBlocker);
    const domain = useAppSelector(state => state.app.domain);
    const dealId = useAppSelector(state => state.app.dealId);

    const run = async () => {
        const ok = await dispatch(generateContract());
        if (!ok || !IS_PROD) return ok;
        const url = getCrmUrl(domain, 'deal', dealId);
        if (url) (window.top ?? window).location.replace(url);
        return ok;
    };

    return {
        blocker,
        isGenerating: generate.status === 'generating',
        isDone: generate.status === 'done',
        error: generate.status === 'error' ? generate.error : null,
        link: generate.link,
        documentName: generate.documentName,
        run,
    };
};
