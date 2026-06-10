'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoblockDetail, InfoblockPackagesAddToPackagesDto } from '../../../model';
import { InfoblockPackageHelper } from '../../api/infoblock-package-helper';

const helper = new InfoblockPackageHelper();

/**
 * Хук для добавления инфоблока в пакеты
 *
 * Используется когда нужно добавить один инфоблок в один или несколько пакетов.
 * Это обратная операция к useAddPackages - здесь id это инфоблок, а не пакет.
 *
 * @example
 * const addToPackages = useAddInfoblockToPackages();
 *
 * // Добавить инфоблок с id 'infoblock1' в пакеты с id 'package1' и 'package2'
 * addToPackages.mutate({
 *   id: 'infoblock1', // ID инфоблока
 *   dto: { packageIds: ['package1', 'package2'] }
 * });
 *
 * @returns {UseMutationResult} Объект мутации с методами mutate, mutateAsync, isPending и т.д.
 */
export const useAddInfoblockToPackages = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockDetail,
        Error,
        { id: string; dto: InfoblockPackagesAddToPackagesDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.addInfoblockToPackages(id, dto);
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
