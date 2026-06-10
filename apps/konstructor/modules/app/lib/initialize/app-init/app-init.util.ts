import { Bitrix } from '@workspace/bitrix';
import { IS_PROD } from '../../../consts/app-global';
import { AppDispatch } from '../../../model/store';
import { WSClient } from '@/modules/shared';
import { appActions } from '../../../model/AppSlice';
import { bitrixInit } from '../bitrix-init/bitrix-init.util';
import { wsInit } from '../../../model/ws/Websocket';

export const appInit = async (
    dispatch: AppDispatch,
    loadingCallBack: () => void,
) => {

    const bitrix = Bitrix.getService();
    const { domain, user, inFrame } = bitrix.api.getInitializedData();

    if (!inFrame && IS_PROD) {
        window.location.href = '/none-auth';
        return;
    }

    const wsService = new WSClient(Number(user.ID), domain); // создаём сокет
    wsService.init(); // <- здесь создаёшь сокет

    dispatch(
        wsInit(
            { userId: Number(user.ID), domain: domain },

        ),
    );

    const bxResult = await bitrixInit();

    if (!bxResult || !bxResult.company) {
        window && window?.location
            ? (window.location.href = '/no-company')
            : null;

        return;
    }
    const { deal, company } = bxResult;


    if (company) {
        dispatch(
            appActions.setAppData({
                domain,
                user,
                deal,
                company,
            }),
        );
    }
    loadingCallBack();

    // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));
};
