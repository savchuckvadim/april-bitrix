'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// Разбор 400 с правилами бэка (`errors[]`) общий для редакторов портала.
import { getQuestionnaireErrorMessage } from '@/modules/entities/portal/questionnaires/lib/questionnaire-error';
import { BADGES_TEXT } from '../../consts/badges.const';
import type { PortalBadgesSave } from '../../model';
import { BadgesHelper } from '../api/badges-helper';

const helper = new BadgesHelper();

export const BADGES_KEY = ['portal-badges'] as const;
export const badgesKey = (portalId?: number) => [...BADGES_KEY, 'doc', portalId] as const;
export const badgesSchemaKey = () => [...BADGES_KEY, 'schema'] as const;

/** Режим, свой набор и общий набор портала. */
export const usePortalBadges = (portalId?: number) =>
    useQuery({
        queryKey: badgesKey(portalId),
        queryFn: () => helper.get(portalId as number),
        enabled: !!portalId,
    });

/** Реестр значений с подписями; одинаков для всех порталов — кэш общий. */
export const useBadgeSchema = (portalId?: number) =>
    useQuery({
        queryKey: badgesSchemaKey(),
        queryFn: () => helper.getSchema(portalId as number),
        enabled: !!portalId,
        staleTime: 10 * 60 * 1000,
    });

/** Сохранить режим и свой набор; ответ бэка сразу ложится в кэш документа. */
export const useSaveBadges = (portalId: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: PortalBadgesSave) => helper.save(portalId, dto),
        onSuccess: data => {
            toast.success(BADGES_TEXT.saved);
            qc.setQueryData(badgesKey(portalId), data);
        },
        onError: error =>
            toast.error(BADGES_TEXT.saveError, {
                description: getQuestionnaireErrorMessage(error),
            }),
    });
};
