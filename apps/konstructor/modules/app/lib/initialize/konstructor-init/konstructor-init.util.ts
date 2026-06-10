import { AppDispatch } from '../../../model/store';
import { getKonstructor } from '@workspace/nest-api';
import {
    saveToLocalStorage,
    getFromLocalStorage,
    getStorageKey,
    clearOldStorageKeys,
} from '@workspace/api';
import { IComplect, initComplects } from '@/modules/entities/complect';
const KONSTRUCTOR_INIT_KEY = 'KONSTRUCTOR_INIT';

export const getInitializeData = async (
    dispatch: AppDispatch,
    domain: string,
): Promise<void> => {
    // complects
    // infoblocks
    // prices
    // supplies
    // regions
    // consalting
    // legalTech
    // star

    // Очищаем старые данные (прошлых месяцев) при инициализации
    await clearOldStorageKeys(KONSTRUCTOR_INIT_KEY);

    const key = getStorageKey(KONSTRUCTOR_INIT_KEY);
    let cachedData = await getFromLocalStorage(key, domain);

    if (!cachedData) {
        const api = getKonstructor();
        const response = await api.konstructorInitInit({ domain });
        cachedData = response;
        // Сохраняем данные с ключом текущего месяца (автоматически обновится в следующем месяце)
        await saveToLocalStorage(key, response, domain);
    }

    const initComplectsData = cachedData?.complects as IComplect[];
    dispatch(initComplects(initComplectsData));
    // dispatch(fetchInfoblocks());
};
