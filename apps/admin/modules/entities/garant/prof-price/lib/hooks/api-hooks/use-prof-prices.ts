'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PriceEntity, CreatePriceDto } from '@/modules/entities/garant/prof-price/model';
import { ProfPricesHelper } from '@/modules/entities/garant/prof-price/lib/api/prof-prices.helper';
import { PROF_PRICE_QUERY_KEY } from '@/modules/entities/garant/prof-price/consts/prof-price.consts';

const helper = new ProfPricesHelper();

export const useProfPrices = () => {
    return useQuery<PriceEntity[], Error>({
        queryKey: [PROF_PRICE_QUERY_KEY],
        queryFn: async () => {
            const response = await helper.list();
            return response;
        },
    });
};

export const useProfPrice = (id: string) => {
    return useQuery<PriceEntity, Error>({
        queryKey: [PROF_PRICE_QUERY_KEY, id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreateProfPrice = () => {
    const queryClient = useQueryClient();

    return useMutation<PriceEntity, Error, CreatePriceDto>({
        mutationFn: async (dto: CreatePriceDto) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
        },
    });
};

export const useUpdateProfPrice = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PriceEntity,
        Error,
        { id: string; dto: CreatePriceDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
            queryClient.invalidateQueries({
                queryKey: [PROF_PRICE_QUERY_KEY, variables.id],
            });
        },
    });
};
