'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoblockDetail, InfoblockPackagesInPackagesSetDto } from '../../../model';
import { InfoblockPackageHelper } from '../../api/infoblock-package-helper';

const helper = new InfoblockPackageHelper();

/**
 * Хук для замены всех пакетов, в которые входит инфоблок
 *
 * Используется когда нужно полностью заменить список пакетов, в которые входит инфоблок.
 * Все существующие связи будут удалены, и будут установлены только те, что указаны в dto.
 * Это обратная операция к useSetPackages - здесь id это инфоблок, а не пакет.
 *
 * @example
 * const setInPackages = useSetInPackages();
 *
 * // Заменить все пакеты для инфоблока с id 'infoblock1' на пакеты с id 'package1' и 'package2'
 * setInPackages.mutate({
 *   id: 'infoblock1', // ID инфоблока
 *   dto: { packageIds: ['package1', 'package2'] }
 * });
 *
 * @returns {UseMutationResult} Объект мутации с методами mutate, mutateAsync, isPending и т.д.
 */
export const useSetInPackages = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockDetail,
        Error,
        { id: string; dto: InfoblockPackagesInPackagesSetDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.setInPackages(id, dto);
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
