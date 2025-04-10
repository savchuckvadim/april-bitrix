import { PClient } from "../type/client-type";
import { getStorageKey } from "@workspace/api";
import { Portal } from "../type/portal-type";

export const removeOldPortalCache = (prefix: string) => {
    const todayKey = getStorageKey(prefix); // Формируем актуальный ключ

    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);

        if (key && key.startsWith(prefix) && key !== todayKey) {
            localStorage.removeItem(key);
            console.log(`🗑 Removed old portal cache: ${key}`);
        }
    }
}

export const getSalesTaskGroupId = (portal: Portal): number => {
    let result = 41
    if (portal) {
        if (portal.bitrixCallingTasksGroup) {

            result = portal.bitrixCallingTasksGroup.bitrixId
        }
    }
    return result;
}

export const getServiceTaskGroupId = (domain: string): number => {

    switch (domain) {
        case PClient.DEV:
            return 15
        case PClient.GSR:
            return 45
        case PClient.APRIL:
            return 9
        default: return 41
    }

}

export const getServiceSignalTaskGroupId = (domain: string): number => {


    switch (domain) {
        case PClient.DEV:
            return 17
        case PClient.GSR:
            return 9
        case PClient.APRIL:
            return 34
        default: return 41
    }

}

