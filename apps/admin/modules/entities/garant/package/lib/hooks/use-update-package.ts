'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageEntityDto } from '@workspace/nest-api';
import { IGarantPackageUpdate } from '../../model';
import { PackageHelper } from '../api/package-helper';

const helper = new PackageHelper();

export const useUpdatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PackageEntityDto,
        Error,
        { id: string; dto: Partial<IGarantPackageUpdate> }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
            queryClient.invalidateQueries({
                queryKey: ['package', variables.id],
            });
        },
    });
};
