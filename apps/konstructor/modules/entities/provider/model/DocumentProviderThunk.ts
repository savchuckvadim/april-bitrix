import {
    API_METHOD,
    getFromLocalStorage,
    getStorageKey,
    onlineAPI,
    removeOldPortalCache,
    saveToLocalStorage,
} from '@workspace/api';

import type { AppDispatch, AppGetState, RootState } from '@/modules/app';

import { PROVIDER_KEY, type Provider } from '../type/provider.type';

import { documentProvidertAC, type ProviderUser } from './DocumentProviderSlice';

function getOfferInitialProviderId(_state: RootState, providers: Provider[]): number {
    return providers[0]?.id ?? 0;
}

type ProvidersBundle = { providers: Provider[]; current: ProviderUser };

export const initProviders =
    (domain: string, userId: number) => async (dispatch: AppDispatch, _getState: AppGetState) => {
        let providers: Provider[] | undefined;
        let currenUserProvider: ProviderUser | null = null;

        const data = { domain, userId };
        const localPrifixProvider = 'provider_cache';
        const localPrifixProviderUser = 'provideruser_cache';

        const storageKeyProvider = getStorageKey(localPrifixProvider);
        const storageKeyProviderUser = getStorageKey(localPrifixProviderUser);
        const secretKey = domain || 'nmbrsdntl';
        removeOldPortalCache(localPrifixProvider);
        removeOldPortalCache(localPrifixProviderUser);
        providers = (await getFromLocalStorage(storageKeyProvider, secretKey)) as Provider[] | undefined;
        currenUserProvider = (await getFromLocalStorage(
            storageKeyProviderUser,
            secretKey,
        )) as ProviderUser | null;

        if (!providers || !currenUserProvider) {
            const res = await onlineAPI.service<ProvidersBundle>(
                'konstructor/front/get/providers',
                API_METHOD.POST,
                data,
            );
            if (res.resultCode === 0 && res.data) {
                providers = res.data.providers;
                currenUserProvider = res.data.current;
                if (providers) {
                    await saveToLocalStorage(storageKeyProvider, providers, secretKey);
                }
                if (currenUserProvider) {
                    await saveToLocalStorage(storageKeyProviderUser, currenUserProvider, secretKey);
                }
            }
        }
        if (providers) {
            const list = providers;
            const currentProvider = list.find(p => p.id == currenUserProvider?.agentId) || null;
            dispatch(documentProvidertAC.setFetched(list, currentProvider));
        }
    };

export const initDocumentProvider =
    (providers: Provider[]) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const currentProviderId = getOfferInitialProviderId(state, providers);
        const currentProvider = providers.find(p => p.id == currentProviderId) || null;
        dispatch(documentProvidertAC.setInit(providers, currentProvider));
    };

export const initProviderUser =
    (domain: string, userId: number) => async (dispatch: AppDispatch, _getState: AppGetState) => {
        const data = { domain, userId };

        const res = await onlineAPI.service<ProviderUser>(
            'konstructor/front/get/provider',
            API_METHOD.POST,
            data,
        );

        if (res.resultCode === 0 && res.data) {
            dispatch(documentProvidertAC.setProviderUser(res.data));
        }
    };

export const setCurrentProviderThunk =
    (providerId: number) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const userId = Number(state.app.bitrix.user?.ID) || 1;
        const providers = state.documentProvider.items;
        const currentProvider = providers.find(provider => provider.id === providerId);
        if (!currentProvider) {
            return;
        }

        const data = {
            domain,
            userId,
            agentId: providerId,
            providerName: currentProvider[PROVIDER_KEY.NAME],
        };

        const res = await onlineAPI.service<ProviderUser>(
            'konstructor/front/provider',
            API_METHOD.POST,
            data,
        );

        if (res.resultCode === 0 && res.data) {
            dispatch(documentProvidertAC.setProviderUser(res.data));
        }
        dispatch(documentProvidertAC.setCurrent(providerId));
    };

export const setCurrentProviderByProviderThunk =
    (currentProvider: Provider) => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        const userId = Number(state.app.bitrix.user?.ID) || 1;
        const localPrifix = 'provideruser_cache';
        const storageKey = getStorageKey(localPrifix);
        const secretKey = domain || 'nmbrsdntl';

        const providerId = currentProvider.id;

        const data = {
            domain,
            userId,
            agentId: providerId,
            providerName: currentProvider[PROVIDER_KEY.NAME],
        };

        const res = await onlineAPI.service<ProviderUser>(
            'konstructor/front/provider',
            API_METHOD.POST,
            data,
        );

        await saveToLocalStorage(storageKey, res.resultCode === 0 ? res.data : null, secretKey);

        if (res.resultCode === 0 && res.data) {
            dispatch(documentProvidertAC.setProviderUser(res.data));
        }
        dispatch(documentProvidertAC.setCurrent(providerId));
    };
