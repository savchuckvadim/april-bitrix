'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { runDocumentToDeal } from '@/modules/app/model/document-run.thunk';
import {
    generateOfferDocument,
    offerDocumentActions,
    offerRequestBlocker,
    selectOfferGenerate,
    selectVariantsPayload,
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
    // только собранные варианты: пропущенные в КП не войдут, о них говорит blocker
    const { variants } = useAppSelector(selectVariantsPayload);

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
        participantTitles: variants.length > 1 ? variants.map(variant => variant.title) : [],
        run,
        reset: () => dispatch(offerDocumentActions.generateReset()),
    };
};
