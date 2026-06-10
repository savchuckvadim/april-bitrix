'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoblockDetail, InfoblockPackagesRemoveDto } from '../../../model';
import { InfoblockPackageHelper } from '../../api/infoblock-package-helper';

const helper = new InfoblockPackageHelper();

/**
 * Хук для удаления инфоблоков из пакета
 *
 * Используется когда нужно удалить один или несколько инфоблоков из существующего пакета.
 *
 * @example
 * const removePackages = useRemovePackages();
 *
 * // Удалить инфоблоки с id 'infoblock1' и 'infoblock2' из пакета с id 'package1'
 * removePackages.mutate({
 *   id: 'package1', // ID пакета
 *   dto: { infoblockIds: ['infoblock1', 'infoblock2'] }
 * });
 *
 * @returns {UseMutationResult} Объект мутации с методами mutate, mutateAsync, isPending и т.д.
 */
export const useRemoveInfoblockPackages = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockDetail,
        Error,
        { id: string; dto: InfoblockPackagesRemoveDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.removePackages(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            // Инвалидируем кэш списка инфоблоков
            queryClient.invalidateQueries({ queryKey: ['infoblocks'] });
            // Инвалидируем кэш конкретного пакета
            queryClient.invalidateQueries({
                queryKey: ['infoblock', variables.id],
            });
        },
    });
};
