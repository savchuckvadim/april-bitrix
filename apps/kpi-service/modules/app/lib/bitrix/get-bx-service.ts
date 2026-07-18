import { Bitrix, BitrixService } from "@workspace/bitrix";
import { TESTING_DOMAIN, TESTING_USER, IS_PROD } from "../../consts/app-global";
import { BXInitializedDto } from "@workspace/bitrix/src/core/dto/bx-initialized.dto";

export interface IGetBXServiceResult extends BXInitializedDto {
    bitrix: Bitrix;

}
export const getBXService = async (): Promise<IGetBXServiceResult | undefined> => {

    const existing = Bitrix.getService();
    console.log('[kpi-init] getBXService: existing service?', !!existing, {
        IS_PROD,
        pathname: typeof window !== 'undefined' ? window.location.pathname : '-',
    });
    const bitrix: BitrixService = existing || await Bitrix.start(TESTING_DOMAIN, TESTING_USER);

    const { domain, user, inFrame, initialized } = bitrix.api.getInitializedData();
    console.log('[kpi-init] getBXService: getInitializedData', {
        inFrame,
        initialized,
        domain,
        userId: user?.ID,
        userName: user?.NAME,
    });

    if (!inFrame && IS_PROD) {
        console.warn('[kpi-init] getBXService: НЕ во фрейме на проде → /none-auth');
        // защита от бесконечной перезагрузки: не редиректим, если уже там
        if (window.location.pathname !== '/none-auth') {
            window.location.href = '/none-auth';
        }
        return;
    }
    return { bitrix, domain, user, inFrame, initialized } as IGetBXServiceResult;

}
