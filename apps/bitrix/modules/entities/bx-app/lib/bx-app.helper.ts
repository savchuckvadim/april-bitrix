import { BitrixAppControllerGetCode, getBitrixAppClient } from "@workspace/nest-api";

export const bxAppHelper = {
    getBxApp: async () => {
        const api = getBitrixAppClient();

        try {
            const response = await api.bitrixAppClientGetApp({
                domain: 'april-garant.bitrix24.ru',
                code: BitrixAppControllerGetCode.sales_full,
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }


    },
};
