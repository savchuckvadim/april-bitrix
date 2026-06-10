import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfPricesHelper } from '@/modules/entities/garant/prof-price/lib/api/prof-prices.helper';
import { PROF_PRICE_QUERY_KEY } from '@/modules/entities/garant/prof-price/consts/prof-price.consts';


export const useDeleteProfPrice = () => {
    const queryClient = useQueryClient();
    const helper = new ProfPricesHelper();
    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await helper.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
        },
    });
};

export const useDeleteManyProfPrices = () => {
    const queryClient = useQueryClient();
    const helper = new ProfPricesHelper();
    return useMutation<void, Error, string[]>({
        mutationFn: async (ids: string[]) => {
            await helper.deleteMany(ids);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
        },
    });
};

export const useDeleteAllProfPrices = () => {
    const queryClient = useQueryClient();
    const helper = new ProfPricesHelper();
    return useMutation<void, Error>({
        mutationFn: async () => {
            await helper.deleteAll();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
        },
    });
};
