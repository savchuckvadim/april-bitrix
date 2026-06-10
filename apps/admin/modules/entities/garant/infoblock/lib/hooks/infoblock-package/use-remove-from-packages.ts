'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoblockDetail, InfoblockPackagesRemoveFromPackagesDto } from '../../../model';
import { InfoblockPackageHelper } from '../../api/infoblock-package-helper';

const helper = new InfoblockPackageHelper();

/**
 * Хук для удаления инфоблока из пакетов
 *
 * Используется когда нужно удалить один инфоблок из одного или нескольких пакетов.
 * Это обратная операция к useRemovePackages - здесь id это инфоблок, а не пакет.
 *
 * @example
 * const removeFromPackages = useRemoveFromPackages();
 *
 * // Удалить инфоблок с id 'infoblock1' из пакетов с id 'package1' и 'package2'
 * removeFromPackages.mutate({
 *   id: 'infoblock1', // ID инфоблока
 *   dto: { packageIds: ['package1', 'package2'] }
 * });
 *
 * @returns {UseMutationResult} Объект мутации с методами mutate, mutateAsync, isPending и т.д.
 */
export const useRemoveFromPackages = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockDetail,
        Error,
        { id: string; dto: InfoblockPackagesRemoveFromPackagesDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.removeFromPackages(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            // Инвалидируем кэш списка инфоблоков
            queryClient.invalidateQueries({ queryKey: ['infoblocks'] });
            // Инвалидируем кэш конкретного инфоблока
            queryClient.invalidateQueries({
                queryKey: ['infoblock', variables.id],
            });
        },
    });
};
