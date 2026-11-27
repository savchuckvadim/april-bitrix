'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { runDocumentToDeal } from '@/modules/app/model/document-run.thunk';
import type { RootState } from '@/modules/app/model/store';
import { selectOfferSalesFlowFields, takeInvoiceNumber } from '../../offer-document';
import { saveSnapshot } from '../../snapshot';
import { offerPdfApi, readOfferPdfError } from '../lib/api/offer-pdf.api';
import { withOfferPdfInvoice, withOfferPdfSalesFlow } from '../lib/build-offer-pdf-request';
import { isOfferPdfSavedToDeal, readOfferPdfResult } from '../lib/offer-pdf-result';
import type { OfferPdfGenerateRequest, OfferPdfGenerateState } from '../model/types';

const INITIAL_GENERATE: OfferPdfGenerateState = { status: 'idle', result: null, error: null };

/** Подпись экрана загрузки, как у Word-КП (use-offer-generate) */
const GENERATE_BUSY_MESSAGE = 'Формирую КП…';

/**
 * «Сформировать PDF»: блокер (в том числе обязательный тип клиента) → слепок
 * сделки (чтобы стиль и сборка пережили уход со страницы, как у Word-потока) →
 * номер счёта у нумератора, если счёт просят и номер пуст → файл вместе со
 * счётом и полями потока продаж (`salesFlow` по отделу, `presentation` с
 * выбранной презентацией). Успех — по ответу бэка.
 *
 * Запуск идёт тем же ходом, что у Word-потока (runDocumentToDeal): экран загрузки
 * на всё время, повторное нажатие ничего не запускает, в Битриксе после успеха
 * окно уходит в сделку; вне Битрикса результат остаётся на экране. Успехом для
 * ухода считается ответ с файлами, прикреплёнными к сделке (isOfferPdfSavedToDeal).
 */
export const useOfferPdfGenerate = (request: OfferPdfGenerateRequest | null, blocker: string | null) => {
    const dispatch = useAppDispatch();
    const store = useStore<RootState>();
    const [generate, setGenerate] = useState<OfferPdfGenerateState>(INITIAL_GENERATE);
    const requestRef = useRef(request);
    requestRef.current = request;
    const blockerRef = useRef(blocker);
    blockerRef.current = blocker;

    const run = useCallback(async (): Promise<boolean> => {
        const current = requestRef.current;
        if (!current || blockerRef.current) return false;
        setGenerate({ status: 'generating', result: null, error: null });
        try {
            // слепок не сохранился — не повод не отдать документ: ошибку покажет статус слепка
            await dispatch(saveSnapshot());
            // номер берём перед самым запросом: сорвавшийся слепок не должен жечь номер нумератора
            const taken = await dispatch(takeInvoiceNumber());
            if (taken.error) {
                setGenerate({ status: 'error', result: null, error: taken.error });
                return false;
            }
            const body = withOfferPdfSalesFlow(
                withOfferPdfInvoice(current, taken.invoice),
                selectOfferSalesFlowFields(store.getState()),
            );
            const result = await offerPdfApi.generate(body);
            setGenerate({ status: 'done', result, error: null });
            // файлы не легли в сделку: уходить из конструктора нельзя, ссылки и причина остаются на экране
            return isOfferPdfSavedToDeal(result);
        } catch (error) {
            setGenerate({ status: 'error', result: null, error: await readOfferPdfError(error) });
            return false;
        }
    }, [dispatch, store]);

    const runToDeal = useCallback(
        () => dispatch(runDocumentToDeal(GENERATE_BUSY_MESSAGE, run)),
        [dispatch, run],
    );

    const reset = useCallback(() => setGenerate(INITIAL_GENERATE), []);

    // ссылки и предупреждения для экрана; пока ответа нет — null
    const outcome = useMemo(() => (generate.result ? readOfferPdfResult(generate.result) : null), [generate.result]);

    return { generate, outcome, run: runToDeal, reset };
};
