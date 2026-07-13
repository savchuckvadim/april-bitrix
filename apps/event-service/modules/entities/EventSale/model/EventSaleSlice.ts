import type { BXDeal, BXList } from "@workspace/bx";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";



//TYPES
export type SaleState = typeof initialState

// у каждой задачи может быть своя основная и еще сделка презентации например
// но у каждой основной сделки может быть еще много предыдущих презентаций

const initialState = {
    taskDeals: {

    } as { [key: number]: any },

    // portalList: null as PBXList | null,
    // portalDeal: null as PBXDeal | null,
    isSaled: false as boolean,
    // isFinite: false as boolean,
    isFetched: false as boolean,
    isCurrentShow: false as boolean,  //показывает ли данные по продаже по текущей задаче 
    // - когда выбирается статус продажа
    isCurrentFetched: false as boolean,
    // presentations: [

    // ] as Array<any>,
    presDeals: {
        items: [] as Array<BXDeal>,
        current: null as null | BXDeal,
        show: null as null | BXDeal,
        isItemsFetched: false as boolean,
        // isCurrentFetched: false as boolean,

    },

    presList: {
        items: [] as Array<BXList>,
        isItemsFetched: false as boolean,
        current: null as null | BXList,
        show: null as null | BXList,

    },
}



const eventSaleSlice = createSlice({
    name: 'eventSale',
    initialState,
    reducers: {

        setPortalSale: (
            state: SaleState,
            action: PayloadAction<{
                // portalList: PBXList | null,
                // portalDeal: PBXDeal | null,
                saleTaskDeals: { [key: number]: any }

            }>

        ) => {
            const payload = action.payload;
            // state.portalList = payload.portalList
            // state.portalDeal = payload.portalDeal
            state.taskDeals = payload.saleTaskDeals
            state.isFetched = true
        },



        setCurrentPresShowStatus: (
            state: SaleState,
            action: PayloadAction<{
                status: boolean,
            }>

        ) => {
            const payload = action.payload;
            state.isCurrentShow = payload.status
            state.isCurrentFetched = payload.status
        },

        // setProp: (
        //     state: SaleState,
        //     action: PayloadAction<{
        //         prop: 'isCurrentFetched',
        //         value: boolean
        //     }>

        // ) => {
        //     const payload = action.payload;
        //     state[payload.prop] = payload.value
        //     state.isCurrentShow = payload.value


        // },
        setCurrentPresList: ( //устанавливает текущий список сделок и list берет из state taskDeals по taskId
            state: SaleState,
            action: PayloadAction<{
                taskId: number | null,  //null - когда надо сбросить

            }>

        ) => {
            let currentPresDeals = [] as Array<BXDeal>
            let currentPresList = [] as Array<BXList>


            const payload = action.payload;
            const taskId = payload.taskId
            const saleTaskDeals = state.taskDeals
            if (taskId) {

                if (saleTaskDeals[taskId]) {
                    if (saleTaskDeals[taskId].allPresentationDeals) {
                        currentPresDeals = saleTaskDeals[taskId].allPresentationDeals

                        currentPresList = saleTaskDeals[taskId].presList

                    }

                }

            }            

            state.presDeals.items = currentPresDeals
            state.presDeals.isItemsFetched = true

            state.presList.items = currentPresList
            state.presList.isItemsFetched = true

        },
        setCurrentPresItem: ( //устанавливает текущий список сделок и list берет из state taskDeals по taskId
            state: SaleState,
            action: PayloadAction<{
                dealId: number | null,  //null - когда надо сбросить
                type: 'show' | 'current'

            }>

        ) => {

            const payload = action.payload;
            const dealId = payload.dealId
            const presDeals = state.presDeals.items

            const currentShowingPresDeal = presDeals.find((deal: BXDeal) =>
                deal.ID === dealId
            ) || null as BXDeal | null

      
                state.presDeals[payload.type] = currentShowingPresDeal


        },


    },

});


export const eventSaleReducer = eventSaleSlice.reducer;

// Экспорт actions
export const eventSaleActions = eventSaleSlice.actions;