'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { AUDIT_TEXT } from '../../consts/ai-analytics-audit.const';
import type { AiAnalyticsAuditResult, AiAnalyticsAuditRun } from '../../model';
import { AiAnalyticsAuditHelper } from '../api/ai-analytics-audit-helper';

const helper = new AiAnalyticsAuditHelper();

/** Общий префикс ключей кэша аудита (описание, снапшот). */
export const AI_ANALYTICS_AUDIT_KEY = ['ai-analytics-audit'] as const;

/**
 * Самоописание аудита; с доменом — ещё и состояние портала (признак
 * разрешения, дата последнего снапшота). Описание одинаково для всех
 * порталов, поэтому при смене домена показываем прежний ответ, пока
 * едет новый: карточка «что делает аудит» не мигает.
 */
export const useAuditAbout = (domain?: string) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_AUDIT_KEY, 'about', domain ?? ''],
        queryFn: () => helper.about(domain),
        placeholderData: previous => previous,
    });

/**
 * Последний снапшот домена. Запрос уходит только по явной просьбе
 * (`enabled`): читать снапшот при каждом выборе портала незачем.
 * 404 — штатный ответ «снапшотов нет», ретраи его только повторяют.
 */
export const useLatestAudit = (domain: string | undefined, enabled: boolean) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_AUDIT_KEY, 'latest', domain ?? ''],
        queryFn: () => helper.latest(domain as string),
        enabled: enabled && !!domain,
        retry: false,
    });

/**
 * Запуск аудита по живой БД. После успеха обновляем состояние портала
 * (дата последнего снапшота) и кэш снапшота домена — если он сохранялся.
 * 403 (признак выключен) приходит текстом бэка: он и в тосте, и в алерте
 * панели через `error` мутации.
 */
export const useRunAudit = () => {
    const queryClient = useQueryClient();
    return useMutation<AiAnalyticsAuditResult, Error, AiAnalyticsAuditRun>({
        mutationFn: dto => helper.run(dto),
        onSuccess: (_result, dto) => {
            const saved = dto.save !== false;
            toast.success(
                saved ? AUDIT_TEXT.runSuccessSaved : AUDIT_TEXT.runSuccess,
            );
            void queryClient.invalidateQueries({
                queryKey: [...AI_ANALYTICS_AUDIT_KEY, 'about', dto.domain],
            });
            if (saved) {
                void queryClient.invalidateQueries({
                    queryKey: [...AI_ANALYTICS_AUDIT_KEY, 'latest', dto.domain],
                });
            }
        },
        onError: error =>
            toast.error(AUDIT_TEXT.runError, {
                description: getApiErrorMessage(error),
            }),
    });
};
