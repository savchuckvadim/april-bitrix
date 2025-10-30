import { BitrixAppGetCode, getBitrixAppClient } from '@workspace/nest-api';


export const getAppHelper = async () => {
    const bxAppApi = getBitrixAppClient()

    const app = await bxAppApi.bitrixAppClientGetApp({
        domain: 'april-garant.bitrix24.ru',
        code: BitrixAppGetCode.sales_full,
    });


    return app;
}
