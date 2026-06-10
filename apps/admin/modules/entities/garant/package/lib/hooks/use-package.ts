'use client';

import { useQuery } from '@tanstack/react-query';
import { PackageEntityDto } from '@workspace/nest-api';
import { PackageHelper } from '../api/package-helper';

const helper = new PackageHelper();

export const usePackages = () => {
    return useQuery<PackageEntityDto[], Error>({
        queryKey: ['packages'],
        queryFn: async () => {
            const response = await helper.list();
            return response;
        },
    });
};

export const usePackage = (id: string) => {
    return useQuery<PackageEntityDto, Error>({
        queryKey: ['package', id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};
