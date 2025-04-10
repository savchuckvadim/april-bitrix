import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { infoblockAPI } from "./InfoblockService";
import { AIBlock, SIBlock } from "../type/document-infoblock-type";



//TYPES
export type DInfoblockState = typeof initialState


export type DGroup = {
    id: number
    title: string
    infoblocks: AIBlock[]
}
export const initialState = {

    items: null as null | AIBlock[],
    groups: [
        {
            id: 0,
            title: 'Нормативно-правовые акты',
            infoblocks: [] as Array<AIBlock>
        },
        {
            id: 1,
            title: 'Нормативно-правовые акты',
            infoblocks: [] as Array<AIBlock>
        },
        {
            id: 2,
            title: 'Нормативно-правовые акты',
            infoblocks: [] as Array<AIBlock>
        },
        {
            id: 3,
            title: 'Нормативно-правовые акты',
            infoblocks: [] as Array<AIBlock>
        },
        {
            id: 4,
            title: 'Нормативно-правовые акты',
            infoblocks: [] as Array<AIBlock>
        },
    ] as Array<DGroup>,
    isLoading: false as boolean,
    isFetched: false as boolean,
    error: '' as string,


}

const infoblockSlice: Slice<DInfoblockState>  = createSlice({
    name: 'infoblock',
    initialState,
    reducers: {

        // infoblocksFetching(state: DInfoblockState, action: PayloadAction<null>) {

        //     
        //     state.isLoading = true;
        //     state.isFetched = false;
        // },
        // infoblocksFetchingSuccess(state: DInfoblockState, action: PayloadAction<SIBlock[]>) {

        //     
        //     state.isLoading = false;
        //     state.isFetched = true;
        //     state.error = '';
        //     state.items = action.payload
        // },
        // infoblocksError(state: DInfoblockState, action: PayloadAction<string>) {

        //     
        //     state.isLoading = false;
        //     state.isFetched = true;
        //     state.error = action.payload
        // },

        addInfoblockToGroup(state, action: PayloadAction<{ groupId: number, infoblock: SIBlock }>) {
            const { groupId, infoblock } = action.payload;
            const group = state.groups.find(g => g.id === groupId);
            // if (group) {
            //     group.infoblocks.push(infoblock);
            // }
        },
        clearInfoblocks(state) {
            state.groups.forEach(group => {
                group.infoblocks = [];
            });
        }

    },

    extraReducers: (builder) => {
        builder
            .addMatcher(
                infoblockAPI.endpoints.fetchIBlocks.matchPending,
                (state) => {
                    state.isLoading = true;
                }
            )
            .addMatcher(
                infoblockAPI.endpoints.fetchIBlocks.matchFulfilled,
                (state, { payload }) => {
                    state.items = payload.map((item: SIBlock) => {
                        return {
                            ...item
                        } as AIBlock
                    })
                    state.groups = state.groups
                        .map(group => {
                            return {
                                ...group,
                                infoblocks: payload
                                    .filter(iblock =>
                                        iblock.groupId === group.id
                                    )
                                    .map(iblock => ({
                                        ...iblock,
                                        checked: false
                                    }))
                            };
                        })
                    state.isLoading = false;
                    state.isFetched = true;
                    state.error = '';
                }
            )
            .addMatcher(
                infoblockAPI.endpoints.fetchIBlocks.matchRejected,
                (state, { error }) => {
                    state.isLoading = false;
                    state.error = error.message ? error.message : 'An error occurred';
                }
            );
    },

});

export const infoblockReducer = infoblockSlice.reducer;

// Экспорт actions
export const infoblockActions: typeof infoblockSlice.actions = infoblockSlice.actions;

