import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { requestWordTemplatePdfPreview } from "../model/thunks/word-template-preview-thunk";
import { wordTemplatePdfPreviewAC } from "../model/WordTemplatePdfPreviewSlice";
import type { WordTemplatePreviewPhase } from "../model/WordTemplatePdfPreviewSlice";

export interface UseWordTemplatePdfPreviewResult {
    previewPhase: WordTemplatePreviewPhase;
    previewPdfObjectUrl: string | null;
    previewError: string | null;
    previewFileName: string | null;
    previewListenersActive: boolean;
    needUpdate: boolean;
    /** Авто-обновление: не дублирует запрос, если превью уже грузится */
    ensurePdfPreview: () => void;
    /** Кнопка «Обновить»: отменяет текущую операцию на сервере и запускает заново */
    refreshPdfPreview: () => void;
    setPreviewListenersActive: (active: boolean) => void;
    setNeedUpdate: (value: boolean) => void;
}

/**
 * Состояние и действия превью PDF (очередь ephemeral-pdf).
 * Используется в {@link WordTemplatePdfPreviewPanel} и там, где нужен refresh/listeners без пропсов.
 */
export const useWordTemplatePdfPreview = (): UseWordTemplatePdfPreviewResult => {
    const dispatch = useAppDispatch();

    const previewPhase = useAppSelector((s) => s.wordTemplatePdfPreview.previewPhase);
    const previewPdfObjectUrl = useAppSelector((s) => s.wordTemplatePdfPreview.previewPdfObjectUrl);
    const previewError = useAppSelector((s) => s.wordTemplatePdfPreview.previewError);
    const previewFileName = useAppSelector((s) => s.wordTemplatePdfPreview.previewFileName);
    const previewListenersActive = useAppSelector((s) => s.wordTemplatePdfPreview.previewListenersActive);
    const needUpdate = useAppSelector((s) => s.wordTemplatePdfPreview.needUpdate);

    const ensurePdfPreview = useCallback(() => {
        dispatch(requestWordTemplatePdfPreview());
    }, [dispatch]);

    const refreshPdfPreview = useCallback(() => {
        dispatch(requestWordTemplatePdfPreview({ force: true }));
    }, [dispatch]);

    const setPreviewListenersActive = useCallback(
        (active: boolean) => {
            dispatch(wordTemplatePdfPreviewAC.setPreviewListenersActive(active));
        },
        [dispatch],
    );
    const setNeedUpdate = useCallback(
        (value: boolean) => {
            dispatch(wordTemplatePdfPreviewAC.setNeedUpdate(value));
        },
        [dispatch],
    );

    return {
        previewPhase,
        previewPdfObjectUrl,
        previewError,
        previewFileName,
        previewListenersActive,
        needUpdate,
        ensurePdfPreview,
        refreshPdfPreview,
        setPreviewListenersActive,
        setNeedUpdate,
    };
};
