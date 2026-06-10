import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SetInfoblocksDto, GetComplectResponseDto } from "../../model";
import { ComplectInfoblocksHelper } from "../api/complect-infoblocks-helper";
import { COMPLECT_ITEM_CASH_KEY, COMPLECT_LIST_CASH_KEY } from "@/modules/entities/garant/complect";

const helper = new ComplectInfoblocksHelper()

export const useSetComplectInfoblocks = (id: string) => {
    const queryClient = useQueryClient();
    // Удаляет все существующие связи
    // Создает новые связи
    return useMutation<GetComplectResponseDto, Error, SetInfoblocksDto>({
        mutationKey: ['set-infoblocks', id],
        mutationFn: async (setInfoblocksDto: SetInfoblocksDto) => {
            const response = await helper.setInfoblocks(id, setInfoblocksDto);
            return response;
        },
        onSuccess: (data) => {
            // Обновляем кеш с новыми данными
            queryClient.setQueryData([COMPLECT_LIST_CASH_KEY, id], data);
            queryClient.setQueryData([COMPLECT_ITEM_CASH_KEY, id], data);
            // queryClient.invalidateQueries({ queryKey: ['complects'] });
        },
    });
}
