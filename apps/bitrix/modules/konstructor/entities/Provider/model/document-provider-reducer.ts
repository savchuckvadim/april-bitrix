// import { InferActionsTypes } from '@/redux/store';
// import { Provider, PROVIDER_KEY } from '@/types/document/provider-type';

// import { documentProvidertAC } from './document-provider-actions';

// export type ProviderStateType = typeof documentProviderInitialState
// export type ActionsType = InferActionsTypes<typeof documentProvidertAC>




// export interface ProviderUser {
//     id: number
//     providerName: string
//     domain: string
//     bxUserId: number
//     agentId: number
// }

// const documentProviderInitialState = {

//     isActive: false,
//     isFetched: false,
//     items: [] as Provider[],
//     current: null as Provider | null,
//     user: null as null | ProviderUser

// }

// const documentProvider = (state: ProviderStateType = documentProviderInitialState, action: ActionsType) => {
//     switch (action.type) {

//         case 'documentProvider/SET_FETCHED':

//             return {
//                 ...state,
//                 items: action.providers,
//                 current: action.currentProvider || (action.providers && action.providers.length && action.providers[0]),
//                 isFetched: true,
//             }


//         case 'documentProvider/SET_INIT':

//             return {
//                 ...state,
//                 items: action.providers,
//                 current: action.currentProvider || (action.providers && action.providers.length && action.providers[0]),
//                 isFetched: true,
//             }

//         case 'documentProvider/SET_CURRENT':


//             return {
//                 ...state,
//                 current: state.items?.find(item => item[PROVIDER_KEY.ID] === action.id)
//             }

//         case 'documentProvider/SET_PROVIDER_USER':


//             return {
//                 ...state,
//                 user: action.provider
//             }




//         default:
//             return state
//     }
// };
// export default documentProvider