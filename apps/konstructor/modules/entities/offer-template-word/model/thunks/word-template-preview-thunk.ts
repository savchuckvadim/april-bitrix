import type { AppDispatch, AppGetState } from '@/modules/app';

import { offerWordPdfPreviewHttp } from '../../lib/api/pdf-preview.api';
import { buildOfferWordTemplateGenerateRequest } from '../../lib/utils/build-offer-word-template-generate-request';
import { wordTemplatePdfPreviewAC } from '../WordTemplatePdfPreviewSlice';
import type { OfferWordEphemeralPdfPollResponse } from '../../types/ephemeral-pdf-types';
import { OfferWordEphemeralPdfStatusEnum } from '../../types/ephemeral-pdf-types';

const POLL_MS = 800;
const MAX_POLLS = 150;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function base64ToBlob(base64: string, mimeType: string): Blob {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType || 'application/pdf' });
}

function revokePreviewUrl(getState: AppGetState, dispatch: AppDispatch) {
    const url = getState().wordTemplatePdfPreview.previewPdfObjectUrl;
    if (url) {
        URL.revokeObjectURL(url);
    }
    dispatch(
        wordTemplatePdfPreviewAC.setPreviewPatch({
            previewPdfObjectUrl: null,
        }),
    );
}

async function stopPreviewOnServer(operationId: string): Promise<void> {
    try {
        await offerWordPdfPreviewHttp.stop(operationId);
    } catch {
        /* отмена на сервере best-effort */
    }
}

export const clearWordTemplatePdfPreviewThunk =
    () => (dispatch: AppDispatch, getState: AppGetState) => {
        const url = getState().wordTemplatePdfPreview.previewPdfObjectUrl;
        if (url) {
            URL.revokeObjectURL(url);
        }
        dispatch(wordTemplatePdfPreviewAC.clear());
    };

export type RequestWordTemplatePdfPreviewOptions = {
    force?: boolean;
};

/**
 * Очередь превью PDF + polling; итог — object URL для react-pdf.
 */
export const requestWordTemplatePdfPreview =
    ({ force = false }: RequestWordTemplatePdfPreviewOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const previewState = getState().wordTemplatePdfPreview;
        if (!force && (previewState.previewPhase === 'starting' || previewState.previewPhase === 'polling')) {
            return;
        }

        const operationIdToStopOnServer = force ? previewState.previewOperationId : null;

        dispatch(wordTemplatePdfPreviewAC.bumpPreviewRequestId());
        const requestId = getState().wordTemplatePdfPreview.previewRequestId;

        if (operationIdToStopOnServer) {
            await stopPreviewOnServer(operationIdToStopOnServer);
        }

        revokePreviewUrl(getState, dispatch);

        dispatch(
            wordTemplatePdfPreviewAC.setPreviewPatch({
                previewPhase: 'starting',
                previewError: null,
                previewOperationId: null,
                previewFileName: null,
            }),
        );
        dispatch(wordTemplatePdfPreviewAC.setNeedUpdate(false));

        let dto = null;
        try {
            dto = buildOfferWordTemplateGenerateRequest(getState());
        } catch (e) {
            dispatch(
                wordTemplatePdfPreviewAC.setPreviewPatch({
                    previewPhase: 'failed',
                    previewError: e instanceof Error ? e.message : 'Ошибка подготовки данных для превью',
                }),
            );
            return;
        }
        if (!dto) {
            dispatch(
                wordTemplatePdfPreviewAC.setPreviewPatch({
                    previewPhase: 'failed',
                    previewError:
                        'Недостаточно данных для превью: выберите шаблон Word, убедитесь что есть сделка и данные документа.',
                }),
            );
            return;
        }

        let operationId: string | undefined;
        try {
            const start = await offerWordPdfPreviewHttp.start(dto);
            operationId = start?.operationId;
            if (!operationId) {
                throw new Error('Сервер не вернул operationId');
            }
        } catch (e) {
            if (getState().wordTemplatePdfPreview.previewRequestId !== requestId) {
                return;
            }
            dispatch(
                wordTemplatePdfPreviewAC.setPreviewPatch({
                    previewPhase: 'failed',
                    previewError: e instanceof Error ? e.message : 'Ошибка запуска превью PDF',
                }),
            );
            return;
        }

        if (getState().wordTemplatePdfPreview.previewRequestId !== requestId) {
            return;
        }

        dispatch(
            wordTemplatePdfPreviewAC.setPreviewPatch({
                previewPhase: 'polling',
                previewOperationId: operationId,
            }),
        );

        for (let i = 0; i < MAX_POLLS; i++) {
            if (getState().wordTemplatePdfPreview.previewRequestId !== requestId) {
                return;
            }

            let poll: OfferWordEphemeralPdfPollResponse;
            try {
                poll = await offerWordPdfPreviewHttp.getStatus(operationId);
            } catch (e) {
                dispatch(
                    wordTemplatePdfPreviewAC.setPreviewPatch({
                        previewPhase: 'failed',
                        previewError: e instanceof Error ? e.message : 'Ошибка опроса превью',
                    }),
                );
                return;
            }

            if (getState().wordTemplatePdfPreview.previewRequestId !== requestId) {
                return;
            }

            if (poll.status === OfferWordEphemeralPdfStatusEnum.READY && poll.pdfBase64) {
                const mime = poll.mimeType || 'application/pdf';
                const blob = base64ToBlob(poll.pdfBase64, mime);
                const objectUrl = URL.createObjectURL(blob);
                dispatch(
                    wordTemplatePdfPreviewAC.setPreviewPatch({
                        previewPhase: 'ready',
                        previewPdfObjectUrl: objectUrl,
                        previewFileName: poll.fileName || 'preview.pdf',
                        previewError: null,
                    }),
                );
                return;
            }

            if (poll.status === OfferWordEphemeralPdfStatusEnum.FAILED) {
                dispatch(
                    wordTemplatePdfPreviewAC.setPreviewPatch({
                        previewPhase: 'failed',
                        previewError: poll.error || 'Генерация PDF завершилась с ошибкой',
                    }),
                );
                return;
            }

            await sleep(POLL_MS);
        }

        dispatch(
            wordTemplatePdfPreviewAC.setPreviewPatch({
                previewPhase: 'failed',
                previewError: 'Превью не успело подготовиться за отведённое время',
            }),
        );
    };
