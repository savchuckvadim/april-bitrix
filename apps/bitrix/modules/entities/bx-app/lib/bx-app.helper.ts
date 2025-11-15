import { BitrixAppGetCode, CreateBitrixAppDto, getBitrixAppClientApp, } from "@workspace/nest-api";
const api = getBitrixAppClientApp();


export const bxAppHelper = {
    getBxApp: async (domain: string, code: BitrixAppGetCode) => {
        try {
            const response = await api.bitrixAppClientGetApp({
                domain: domain,
                code: code,
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }


    },
    getPortalApps: async (portalId: number) => {
        try {
            const response = await api.bitrixAppClientGetPortalApps({
                portalId: portalId,
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }

    },
    getEnabledApps: async () => {
        try {
            const response = await api.bitrixAppClientGetEnabledApps();
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    storeOrUpdateApp: async (app: CreateBitrixAppDto) => {
        try {
            const response = await api.bitrixAppClientCreateApp(app);
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};
