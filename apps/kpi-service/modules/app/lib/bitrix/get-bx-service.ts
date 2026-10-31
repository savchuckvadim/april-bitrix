import { Bitrix, BitrixService } from "@workspace/bitrix";
import { TESTING_DOMAIN, TESTING_USER, IS_PROD } from "../../consts/app-global";
import { BXInitializedDto } from "@workspace/bitrix/src/core/dto/bx-initialized.dto";
import { withBasePath } from "@/modules/shared/lib/base-path";

export interface IGetBXServiceResult extends BXInitializedDto {
    bitrix: Bitrix;

}
export const getBXService = async (): Promise<IGetBXServiceResult | undefined> => {

    const bitrix: BitrixService = Bitrix.getService() || await Bitrix.start(TESTING_DOMAIN, TESTING_USER);

    const { domain, user, inFrame, initialized } = bitrix.api.getInitializedData();

    if (!inFrame && IS_PROD) {
        // защита от бесконечной перезагрузки: не редиректим, если уже там
        const noneAuthPath = withBasePath('/none-auth');
        if (window.location.pathname !== noneAuthPath) {
            window.location.href = noneAuthPath;
        }
        return;
    }
    return { bitrix, domain, user, inFrame, initialized } as IGetBXServiceResult;

}
