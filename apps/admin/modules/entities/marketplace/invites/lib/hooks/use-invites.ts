'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    InviteDto,
    IssueInviteDto,
    IssuedInviteDto,
    MarketplaceModerationGetInvitesParams,
    ReissueInviteDto,
} from '@workspace/nest-admin-api';
import { InvitesHelper } from '../api/invites-helper';

const helper = new InvitesHelper();

const INVITES_KEY = 'marketplace-invites';

/** Список кодов подключения (фильтры: статус, email). */
export const useInvites = (params?: MarketplaceModerationGetInvitesParams) => {
    return useQuery<InviteDto[], Error>({
        queryKey: [INVITES_KEY, params?.status ?? '', params?.email ?? ''],
        queryFn: () => helper.list(params),
        placeholderData: (prev) => prev,
    });
};

/**
 * Выпуск кода. Ответ содержит открытый код — показать его в диалоге
 * сразу: второй раз получить тот же код невозможно (хранится хэш).
 */
export const useIssueInvite = () => {
    const queryClient = useQueryClient();
    return useMutation<IssuedInviteDto, Error, IssueInviteDto>({
        mutationFn: (dto) => helper.issue(dto),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [INVITES_KEY] });
        },
    });
};

/** Отзыв кода: погасить его больше нельзя. */
export const useRevokeInvite = () => {
    const queryClient = useQueryClient();
    return useMutation<InviteDto, Error, string>({
        mutationFn: (id) => helper.revoke(id),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [INVITES_KEY] });
        },
    });
};

/** Перевыпуск: старый код отзывается, новый уходит письмом. */
export const useReissueInvite = () => {
    const queryClient = useQueryClient();
    return useMutation<
        IssuedInviteDto,
        Error,
        { id: string; dto: ReissueInviteDto }
    >({
        mutationFn: ({ id, dto }) => helper.reissue(id, dto),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [INVITES_KEY] });
        },
    });
};
