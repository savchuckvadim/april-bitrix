'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PackageEntityDto } from '@workspace/nest-admin-api';
import { IGarantPackageCreate } from '../../model';
import { PackageHelper } from '../api/package-helper';

const helper = new PackageHelper();

export const useCreatePackage = () => {
    const queryClient = useQueryClient();

    return useMutation<PackageEntityDto, Error, IGarantPackageCreate>({
        mutationFn: async (dto: IGarantPackageCreate) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['packages'] });
        },
    });
};
