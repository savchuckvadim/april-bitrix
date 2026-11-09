'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { aiHelper } from '@/modules/entities/ai-analytics/model/ai-analytics-thunks.shared';
import type { MicroSelectOption } from '@workspace/april-ui';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    AI_OWNER_REPORT_DELIVERY_STATUSES,
    AI_OWNER_REPORT_KINDS,
    fetchAiOwnerReport,
    selectAiIsLeader,
    selectAiRequester,
    type AiOwnerReportKind,
} from '@/modules/entities/ai-analytics';
import {
    AI_OWNER_REPORT_KIND_LABELS,
    AI_OWNER_REPORT_TEXT,
    aiOwnerReportPeriodLabel,
    aiOwnerReportSendMessage,
} from '../lib/ai-owner-report.texts';
import {
    aiOwnerReportPdfFilename,
    saveBlobAsFile,
} from '../lib/ai-owner-report-download.util';

/** Значение селекта «последний закрытый период». */
export const AI_OWNER_REPORT_LATEST = 'latest';

/** Состояние «Отправить себе»: идёт, итог словами, ссылка на PDF, неудача. */
export interface AiOwnerReportSendState {
    loading: boolean;
    message: string | null;
    fileUrl: string | null;
    failed: boolean;
}

const SEND_IDLE: AiOwnerReportSendState = {
    loading: false,
    message: null,
    fileUrl: null,
    failed: false,
};

/**
 * Состояние подвкладки «Отчёт за период»: вид периода и ключ (пусто —
 * последний закрытый) живут в состоянии хука, запрос — секция ownerReport
 * (очередь + WS, гарды thunk не дают дублей). Список доступных периодов
 * приходит в ответе: в селект — они плюс «последний закрытый».
 * «Собрать заново» — force: сервер пересобирает, минуя кэш и снапшот.
 */
export const useAiOwnerReport = () => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.ownerReport);
    const query = useAppSelector(state => state.aiAnalytics.ownerReportQuery);
    const isLeader = useAppSelector(selectAiIsLeader);
    const requester = useAppSelector(selectAiRequester);
    const hasRequester = requester !== null;
    const [pdfState, setPdfState] = useState<{ loading: boolean; error: string | null }>({
        loading: false,
        error: null,
    });
    const [sendState, setSendState] = useState<AiOwnerReportSendState>(SEND_IDLE);
    const [kind, setKind] = useState<AiOwnerReportKind>(query?.kind ?? 'month');
    const [periodKey, setPeriodKey] = useState<string | null>(query?.periodKey ?? null);

    useEffect(() => {
        if (!hasRequester || !isLeader) return;
        dispatch(fetchAiOwnerReport({ kind, periodKey }));
    }, [dispatch, hasRequester, isLeader, kind, periodKey]);

    const data = section.status === 'ready' ? section.data : null;
    const kindOptions = useMemo<MicroSelectOption[]>(
        () =>
            Object.values(AI_OWNER_REPORT_KINDS).map(value => ({
                value,
                label: AI_OWNER_REPORT_KIND_LABELS[value],
            })),
        [],
    );
    const periodOptions = useMemo<MicroSelectOption[]>(() => {
        const keys = new Set<string>(data?.availablePeriods ?? []);
        if (data?.kind === kind) keys.add(data.periodKey);
        if (periodKey) keys.add(periodKey);
        return [
            { value: AI_OWNER_REPORT_LATEST, label: AI_OWNER_REPORT_TEXT.latestOption },
            ...[...keys]
                .sort((a, b) => b.localeCompare(a))
                .map(key => ({ value: key, label: aiOwnerReportPeriodLabel(kind, key) })),
        ];
    }, [data, kind, periodKey]);

    const changeKind = useCallback((value: string) => {
        if (value in AI_OWNER_REPORT_KINDS) {
            setKind(value as AiOwnerReportKind);
            setPeriodKey(null);
        }
    }, []);
    const changePeriod = useCallback((value: string) => {
        setPeriodKey(value === AI_OWNER_REPORT_LATEST ? null : value);
    }, []);
    const downloadPdf = useCallback(async () => {
        if (!requester || !data) return;
        setPdfState({ loading: true, error: null });
        try {
            const blob = await aiHelper.downloadOwnerReportPdf(requester, {
                kind: data.kind,
                periodKey: data.periodKey,
            });
            saveBlobAsFile(blob, aiOwnerReportPdfFilename(data.kind, data.periodKey));
            setPdfState({ loading: false, error: null });
        } catch {
            setPdfState({ loading: false, error: AI_OWNER_REPORT_TEXT.pdf.error });
        }
    }, [requester, data]);
    /** Выпуск отчёта себе: личное сообщение и PDF на Диске — проверка доставки. */
    const sendToSelf = useCallback(async () => {
        if (!requester || !data) return;
        setSendState({ ...SEND_IDLE, loading: true });
        try {
            const response = await aiHelper.sendOwnerReportToSelf(requester, {
                kind: data.kind,
                periodKey: data.periodKey,
            });
            const result = response.data;
            if (!result) throw new Error(response.message);
            setSendState({
                loading: false,
                message: aiOwnerReportSendMessage(result),
                fileUrl: result.fileUrl,
                failed: result.status !== AI_OWNER_REPORT_DELIVERY_STATUSES.sent,
            });
        } catch {
            setSendState({
                ...SEND_IDLE,
                message: AI_OWNER_REPORT_TEXT.send.error,
                failed: true,
            });
        }
    }, [requester, data]);
    const rebuild = useCallback(
        () => dispatch(fetchAiOwnerReport({ kind, periodKey }, { force: true })),
        [dispatch, kind, periodKey],
    );

    return {
        ...section,
        data,
        isLeader,
        kind,
        periodKey: periodKey ?? AI_OWNER_REPORT_LATEST,
        kindOptions,
        periodOptions,
        changeKind,
        changePeriod,
        rebuild,
        retry: rebuild,
        downloadPdf,
        pdfLoading: pdfState.loading,
        pdfError: pdfState.error,
        sendToSelf,
        send: sendState,
    };
};

export type AiOwnerReportState = ReturnType<typeof useAiOwnerReport>;
