// import { getBxService } from '@workspace/api';

import { bxAPI } from "@workspace/api";


export const bxInstallHelper = async () => {
    console.log('bxInstallHelper');
    // const BX24 = await getBxService();
    // console.log('BX24');

    // const installFinish = await BX24.installFinish();
    // const data = installFinish.getData().result;
    // console.log('data installFinish');
    // console.log(data);
    // // Проверка, что приложение реально установлено
    // await getInstallStatus(); // если упадёт — кинет ошибку
    const data = await bxAPI.install();
    console.log('data install');
    console.log(data);
    return data;


};


export const getPlacementList = async () => {
    // const BX24 = await getBxService();
    // const list = await BX24.callMethod('placement.list');
    // return list;
};


export const getInstallStatus = async () => {
    // const BX24 = await getBxService();
    // const status = await BX24.callMethod('app.info');
    // const data = status.getData().result;
    // console.log('data app.info');
    // console.log(data);
    // return data;
};
