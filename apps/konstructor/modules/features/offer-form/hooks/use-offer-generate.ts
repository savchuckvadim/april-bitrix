'use client';

import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { runDocumentToDeal } from '@/modules/app/model/document-run.thunk';
import {
    selectComplectVariantState,
    selectParticipants,
    selectVariantStageOf,
} from '@/modules/entities/complect-variant';
import {
    generateOfferDocument,
    offerDocumentActions,
    offerRequestBlocker,
    selectOfferGenerate,
} from '@/modules/entities/offer-document';

/**
 * «Сформировать КП»: generate-multi, затем в Битриксе — уход в сделку
 * (документы придут в неё очередью, легаси window.top.location.replace);
 * вне Битрикса — ссылки на готовые файлы прямо на экране.
 */
export const useOfferGenerate = () => {
    const dispatch = useAppDispatch();
    const generate = useAppSelector(selectOfferGenerate);
    const blocker = useAppSelector(offerRequestBlocker);
    const variants = useAppSelector(selectComplectVariantState);
    const stageOf = useAppSelector(selectVariantStageOf);

    const participantTitles = useMemo(
        () =>
            selectParticipants(variants.records, stageOf).map(record => {
                const item = variants.items.find(candidate => candidate.id === Number(record.variantSmartId));
                return item?.title || `Вариант ${record.variantSmartId ?? record.id}`;
            }),
        [variants.records, variants.items, stageOf],
    );

    // экран загрузки на всё время, повторное нажатие не запускает второй документ
    const run = () =>
        dispatch(runDocumentToDeal('Формирую КП…', () => dispatch(generateOfferDocument())));

    return {
        blocker,
        isGenerating: generate.status === 'generating',
        isDone: generate.status === 'done',
        isQueued: generate.status === 'done' && Boolean(generate.operationId),
        error: generate.status === 'error' ? generate.error : null,
        links: generate.links,
        warnings: generate.warnings,
        // в КП попадёт несколько вариантов — менеджер должен это видеть до кнопки
        participantTitles: participantTitles.length > 1 ? participantTitles : [],
        run,
        reset: () => dispatch(offerDocumentActions.generateReset()),
    };
};
