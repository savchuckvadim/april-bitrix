// import { EVSBXRQ } from "@/modules/bx-rq/type/evs-rq-type";
// import { RQ_TYPE } from "@/redux/reducers/document/contract/type/document-contract-type";
// import {  BX_ADDRESS_TYPE } from "../type/evs-address-type";

// import { SupplyTypesType } from "@bx-rq/types/supply-type";
// import { CONTRACT_LTYPE } from "@bx-rq/types/contract-type";
// import { BXRQState } from "./bx-rq-reducer";

// //ACION CREATORS
// export const BXRQAC = {
//   setFetched: (bxrq: EVSBXRQ) =>
//     ({ type: "bxrq/SET_FETCHED", bxrq } as const),
//   setFetchedStatus: (status: boolean) =>
//     ({ type: "bxrq/SET_FETCHED_STATUS", status } as const),
//   setLoading: () =>
//     ({ type: "bxrq/SET_LOADING_STATUS" } as const),
//   setCreatingLoadingStatus: (status: boolean) =>
//     ({ type: "bxrq/SET_CREATING_LOADING_STATUS", status } as const),
//   setCurrentRqItems: (clientType: RQ_TYPE) =>
//     ({ type: "bxrq/SET_CURRENT_RQ_ITEMS", clientType } as const),
//   saveCurrentRqItems: (clientType: RQ_TYPE) =>
//     ({ type: "bxrq/SAVE_CURRENT_RQ_ITEMS", clientType } as const),

//   setCurrentItem: (rq_id: number) =>
//     ({ type: "bxrq/SET_CURRENT_ITEM", rq_id } as const),

//   // saveCurrent: (departament: Array<BitrixUser>) =>
//   //   ({ type: "bxrq/SAVE_CURRENT", departament } as const),

//   initBaseCreating: (
//     currentClientType: RQ_TYPE | undefined,
//     contractType: CONTRACT_LTYPE,
//     supplyType: SupplyTypesType
//   ) => ({
//     type: "bxrq/INIT_BASE_CREATING",
//     currentClientType,
//     contractType,
//     supplyType

//   } as const),
//   saveBaseCreating: (updatedState: BXRQState) => ({ type: "bxrq/SAVE_BASE_CREATING", updatedState } as const),
//   cancelBaseCreating: () => ({ type: "bxrq/CANCEL_BASE_CREATING" } as const),

//   initAddressCreating: (typeId: BX_ADDRESS_TYPE) => ({ type: "bxrq/INIT_ADDRESS_CREATING", typeId } as const),
//   initCopyAddressCreating: (typeId: BX_ADDRESS_TYPE) => ({ type: "bxrq/INIT_COPY_ADDRESS_CREATING", typeId } as const),

//   saveAddressCreating: (typeId: BX_ADDRESS_TYPE, clientType: RQ_TYPE) => ({ type: "bxrq/SAVE_ADDRESS_CREATING", typeId, clientType } as const),
//   cancelAddressCreating: () => ({ type: "bxrq/CANCEL_ADDRESS_CREATING" } as const),

//   initBankCreating: (bankId: number) => ({ type: "bxrq/INIT_BANK_CREATING", bankId } as const),

//   saveBankCreating: (bankId: number, clientType: RQ_TYPE) => ({ type: "bxrq/SAVE_BANK_CREATING", bankId, clientType } as const),
//   cancelBankCreating: () => ({ type: "bxrq/CANCEL_BANK_CREATING" } as const),

//   setBaseProp: (code: string, value: string) => ({ type: "bxrq/SET_BASE_PROP", code, value } as const),
//   setFullBaseProp: (code: string, value: string) => ({ type: "bxrq/SET_FULL_BASE_PROP", code, value } as const), // не добавляет а заменяет значения

//   setAddressProp: (addressTypeId: BX_ADDRESS_TYPE, code: string, value: string) =>
//     ({ type: "bxrq/SET_ADDRESS_PROP", addressTypeId, code, value } as const),
//   setBankProp: (bankId: number, code: string, value: string) =>
//     ({ type: "bxrq/SET_BANK_PROP", bankId, code, value } as const),

//   setError: (code: string, value: string) => ({ type: "bxrq/SET_ERROR", code, value } as const),
//   cleanError: (code: string,) => ({ type: "bxrq/CLEAN_ERROR", code } as const),
//   cleanErrors: () => ({ type: "bxrq/CLEAN_ERRORS" } as const),
//   setReqired: (errors: string[]) => ({ type: "bxrq/SET_REQUIRED", errors } as const),
//   setReqiredUnderstand: (status: boolean) => ({ type: "bxrq/SET_REQUIRED_UNDERSTAND", status } as const),

// };
