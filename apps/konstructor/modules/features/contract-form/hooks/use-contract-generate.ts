'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { runDocumentToDeal } from '@/modules/app/model/document-run.thunk';
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

    // экран загрузки на всё время, повторное нажатие не запускает второй документ
    const run = () =>
        dispatch(runDocumentToDeal('Формирую договор…', () => dispatch(generateContract())));

    return {
        blocker,
        isGenerating: generate.status === 'generating',
        isDone: generate.status === 'done',
        error: generate.status === 'error' ? generate.error : null,
        link: generate.link,
        documentName: generate.documentName,
        savedToDisk: generate.savedToDisk,
        run,
    };
};
