'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoblockDetail, InfoblockPackagesAddDto } from '../../../model';
import { InfoblockPackageHelper } from '../../api/infoblock-package-helper';

const helper = new InfoblockPackageHelper();

/**
 * Хук для добавления инфоблоков в пакет
 *
 * Используется когда нужно добавить один или несколько инфоблоков в существующий пакет.
 *
 * @example
 * const addPackages = useAddInfoblockPackages();
 *
 * // Добавить инфоблоки с id 'infoblock1' и 'infoblock2' в пакет с id 'package1'
 * addPackages.mutate({
 *   id: 'package1', // ID пакета
 *   dto: { infoblockIds: ['infoblock1', 'infoblock2'] }
 * });
 *
 * @returns {UseMutationResult} Объект мутации с методами mutate, mutateAsync, isPending и т.д.
 */
export const useAddInfoblockPackages = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockDetail,
        Error,
        { id: string; dto: InfoblockPackagesAddDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.addPackages(id, dto);

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
