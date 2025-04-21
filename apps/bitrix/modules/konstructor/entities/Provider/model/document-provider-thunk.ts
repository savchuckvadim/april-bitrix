// import { Provider, PROVIDER_KEY } from "@/types/document/provider-type";
// import { documentProvidertAC } from "./document-provider-actions";
// import { AppDispatchType, AppStateType } from "@/redux/store";
// import { onlineAPI } from "@/services/april-online-api";
// import { API_METHOD } from "@/types/entity-types";
// import { ProviderStateType, ProviderUser } from "./document-provider-reducer";
// import { EV_DEAL_PROP, pbxDealAC } from "../../pbx-deal/pbx-deal-reducer";
// import { updateDealSimpleField } from "../../pbx-deal/pbx-deal-thunk";
// import { DocumentProvider } from "@/types/document/document-rq-type";
// import { getOfferInitialProviderId } from "@/utils/reducers-utils/document/document-provider";
// import { getFromLocalStorage, getStorageKey, removeOldPortalCache, saveToLocalStorage } from "../../portal/lib/store-portal-util";


// type GetStateType = () => AppStateType;


// export const initProviders =
//     (domain: string, userId: number) => async (dispatch: AppDispatchType, getState: GetStateType) => {
//         let providers: Provider[] | undefined;
//         let currenUserProvider: ProviderUser | undefined;
//
//         const data = {
//             domain,
//             userId,

//         }
//         const localPrifixProvider = 'provider_cache';
//         const localPrifixProviderUser = 'provideruser_cache';

//         const storageKeyProvider = getStorageKey(localPrifixProvider);
//         const storageKeyProviderUser = getStorageKey(localPrifixProviderUser);
//         const secretKey = domain || 'nmbrsdntl';
//         removeOldPortalCache(localPrifixProvider)
//         removeOldPortalCache(localPrifixProviderUser)
//         providers = await getFromLocalStorage(storageKeyProvider, secretKey);
//         currenUserProvider = await getFromLocalStorage(storageKeyProviderUser, secretKey);
//
//         if (!providers || !currenUserProvider) {
//             const response = await onlineAPI
//                 .service(
//                     'konstructor/front/get/providers',
//                     API_METHOD.POST,
//                     'result',
//                     data
//                 ) as { providers: Provider[], current: ProviderUser } | null
//
//             if (response && response.providers && response.current) {
//                 providers = response.providers;
//                 currenUserProvider = response.current
//                 await saveToLocalStorage(storageKeyProvider, providers, secretKey);
//                 await saveToLocalStorage(storageKeyProviderUser, currenUserProvider, secretKey);
//

//             }
//         }
//         if (providers && currenUserProvider) {
//             providers = providers as Provider[];
//             currenUserProvider = currenUserProvider as ProviderUser
//
//             const currentProvider = providers.find(p => p.id == (currenUserProvider as ProviderUser).agentId) || null;
//             dispatch(documentProvidertAC.setInit(providers, currentProvider));
//         }
//
//         // provider && dispatch(documentProvidertAC.setProviderUser(provider));
//     };



// export const initDocumentProvider =
//     (providers: Provider[]) => async (dispatch: AppDispatchType, getState: GetStateType) => {


//         const state = getState();

//         const currentProviderId = getOfferInitialProviderId(state, providers)
//         const currentProvider = providers.find(p => p.id == currentProviderId) || null;
//         dispatch(documentProvidertAC.setInit(providers, currentProvider));
//     };


// export const initProviderUser =
//     (domain: string, userId: number) => async (dispatch: AppDispatchType, getState: GetStateType) => {


//         const data = {
//             domain,
//             userId,

//         }

//         const provider = await onlineAPI
//             .service(
//                 'konstructor/front/get/provider',
//                 API_METHOD.POST,
//                 'provider',
//                 data
//             ) as ProviderUser | null


//         provider && dispatch(documentProvidertAC.setProviderUser(provider));
//     };

// export const setCurrentProviderThunk =
//     (providerId: number) => async (dispatch: AppDispatchType, getState: GetStateType) => {

//         const state = getState()
//         const domain = state.app.domain
//         const userId = state.app.currentUser?.ID || 1
//         const providers = (state.documentProvider as ProviderStateType).items
//         const currentProvider = providers.find(provider => provider.id === providerId)

//         if (currentProvider) {


//             const data = {
//                 domain,
//                 userId,
//                 agentId: providerId,
//                 providerName: currentProvider[PROVIDER_KEY.NAME]

//             }

//             const provider = await onlineAPI
//                 .service(
//                     'konstructor/front/provider',
//                     API_METHOD.POST,
//                     'provider',
//                     data
//                 ) as ProviderUser | null


//             provider && dispatch(documentProvidertAC.setProviderUser(provider));
//             dispatch(documentProvidertAC.setCurrent(providerId))

//             dispatch(updateDealSimpleField(EV_DEAL_PROP.PROVIDER, currentProvider[PROVIDER_KEY.NAME]))
//             dispatch(pbxDealAC.setCurrentProp(currentProvider[PROVIDER_KEY.NAME], EV_DEAL_PROP.PROVIDER))
//         }
//     };


// export const setCurrentProviderByProviderThunk =
//     (currentProvider: DocumentProvider) => async (dispatch: AppDispatchType, getState: GetStateType) => {

//         const state = getState()
//         const domain = state.app.domain
//         const userId = state.app.currentUser?.ID || 1
//         const localPrifix = 'provideruser_cache';
//         const storageKey = getStorageKey(localPrifix);
//         const secretKey = domain || 'nmbrsdntl';

//         if (currentProvider) {
//             const providerId = currentProvider.id

//             const data = {
//                 domain,
//                 userId,
//                 agentId: providerId,
//                 providerName: currentProvider[PROVIDER_KEY.NAME]

//             }

//             const provider = await onlineAPI
//                 .service(
//                     'konstructor/front/provider',
//                     API_METHOD.POST,
//                     'provider',
//                     data
//                 ) as ProviderUser | null

//             await saveToLocalStorage(storageKey, provider, secretKey);

//             provider && dispatch(documentProvidertAC.setProviderUser(provider));
//             dispatch(documentProvidertAC.setCurrent(providerId))

//             dispatch(updateDealSimpleField(EV_DEAL_PROP.PROVIDER, currentProvider[PROVIDER_KEY.NAME]))
//             dispatch(pbxDealAC.setCurrentProp(currentProvider[PROVIDER_KEY.NAME], EV_DEAL_PROP.PROVIDER))
//         }
//     };