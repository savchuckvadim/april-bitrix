'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';
import type { IUserSelectedTemplateRequest } from '../../model';

const helper = new WordTemplateHelper();

/**
 * Действия ОТ ЛИЦА пользователя портала: текущий / избранное / активность.
 *
 * Это те же ручки, что зовёт легаси-конструктор для самого пользователя
 * (`POST /user-selected-templates/{current|favorite|active}`), только
 * `bitrix_user_id` подставляет админ. После любого действия
 * инвалидируется список «шаблоны глазами пользователя».
 */
export const useUserSelectedTemplateActions = () => {
    const queryClient = useQueryClient();

    const invalidate = (req: IUserSelectedTemplateRequest) =>
        queryClient.invalidateQueries({
            queryKey: [
                WORD_TEMPLATE_LIST_CASH_KEY,
                'user',
                String(req.bitrix_user_id),
                String(req.portal_id),
            ],
        });

    const setCurrent = useMutation({
        mutationFn: async (req: IUserSelectedTemplateRequest) => helper.setUserCurrent(req),
        onSuccess: (_, req) => invalidate(req),
    });

    const setFavorite = useMutation({
        mutationFn: async ({
            req,
            isFavorite,
        }: {
            req: IUserSelectedTemplateRequest;
            isFavorite: boolean;
        }) => helper.setUserFavorite(req, isFavorite),
        onSuccess: (_, { req }) => invalidate(req),
    });

    const setActive = useMutation({
        mutationFn: async ({
            req,
            isActive,
        }: {
            req: IUserSelectedTemplateRequest;
            isActive: boolean;
        }) => helper.setUserActive(req, isActive),
        onSuccess: (_, { req }) => invalidate(req),
    });

    return { setCurrent, setFavorite, setActive };
};
