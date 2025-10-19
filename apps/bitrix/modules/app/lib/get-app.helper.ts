import { BitrixAppControllerGetCode, getBitrixAppClient } from '@workspace/nest-api';


export const getAppHelper = async () => {
    const bxAppApi = getBitrixAppClient()

    const app = await bxAppApi.bitrixAppClientGetApp({
        domain: 'april-garant.bitrix24.ru',
        code: BitrixAppControllerGetCode.sales_full,
    });


    return app;
}
