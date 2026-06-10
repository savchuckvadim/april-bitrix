import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InfoblockHelper } from "../api/infoblock-helper";

export const useDeleteInfoblock = () => {
    const helper = new InfoblockHelper();
    const queryClient = useQueryClient();
    return useMutation<boolean, Error, string>({
        mutationFn: async (id: string) => {
            const response = await helper.delete(id);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['infoblocks'] });
            queryClient.invalidateQueries({ queryKey: ['infoblock', variables] });
        },
    });
};
