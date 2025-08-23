import { PayloadAction, createSlice, current } from "@reduxjs/toolkit";
import { RegionType } from "../type/global-types";

type StateType = typeof initialState;

enum GLOBAL_SUPPLY_NAME {
  INTERNET = "Интернет",
  PROXIMA = "Проксима",
}

enum GLOBAL_COMPLAECT_TYPE_NAME {
  UNIVERSAL = "Универсальная линейка",
  PROF = "ПРОФ",
}
export enum GLOBAL_STATE_PROP {
  SUPPLY = "supply",
  COMPLECT = "complect",
  REGION = "region",
}
export type ComplectSettingsSelectItem = {
  id: number;
  title: GLOBAL_SUPPLY_NAME | GLOBAL_COMPLAECT_TYPE_NAME;
};
type GlobalSupplySelectItem = {
  id: number;
  title: GLOBAL_SUPPLY_NAME;
};

type GlobalComplectSelectItem = {
  id: number;
  title: GLOBAL_COMPLAECT_TYPE_NAME;
};
type GlobalRegionSelectItem = {
  id: number;
  title: string;
};

type GlobalSettingsCurrentState = {
  [GLOBAL_STATE_PROP.SUPPLY]: null | GlobalSupplySelectItem;
  [GLOBAL_STATE_PROP.COMPLECT]: null | GlobalComplectSelectItem;
  [GLOBAL_STATE_PROP.REGION]: null | GlobalRegionSelectItem;
};
type GlobalStateItemSupply = {
  name: "Тип Доступа";
  values: Array<GlobalSupplySelectItem>;
};
type GlobalStateItemComplect = {
  name: "Тип Комплекта";
  values: Array<GlobalComplectSelectItem>;
};
type GlobalStateItemRegion = {
  name: "Регион";
  values: Array<GlobalRegionSelectItem>;
};
export const KMV = "КМВ";
export const STV = "Ставрополь";

const initialState = {
  [GLOBAL_STATE_PROP.SUPPLY]: {
    name: "Тип Доступа",
    values: [
      { id: 0, title: GLOBAL_SUPPLY_NAME.INTERNET },
      { id: 1, title: GLOBAL_SUPPLY_NAME.PROXIMA },
    ],
  } as GlobalStateItemSupply,

  [GLOBAL_STATE_PROP.COMPLECT]: {
    name: "Тип Комплекта",
    values: [
      { id: 0, title: GLOBAL_COMPLAECT_TYPE_NAME.UNIVERSAL },
      { id: 1, title: GLOBAL_COMPLAECT_TYPE_NAME.PROF },
    ],
  } as GlobalStateItemComplect,

  [GLOBAL_STATE_PROP.REGION]: {
    name: "Регион",
    values: [
      { id: 0, title: KMV },
      { id: 1, title: STV },
    ],
  } as GlobalStateItemRegion,
  current: {
    [GLOBAL_STATE_PROP.SUPPLY]: {
      id: 0,
      title: GLOBAL_SUPPLY_NAME.INTERNET,
    } as GlobalSupplySelectItem,
    [GLOBAL_STATE_PROP.COMPLECT]: {
      id: 1,
      title: GLOBAL_COMPLAECT_TYPE_NAME.PROF,
    } as GlobalComplectSelectItem,
    [GLOBAL_STATE_PROP.REGION]: { id: 0, title: KMV } as GlobalRegionSelectItem,
  } as GlobalSettingsCurrentState,

  status: false as boolean,
  message: "",
  error: {
    region: null as null | string,
    complect: null as null | string,
    supply: null as null | string,
  },
};

const documentComplectSettingsSlice = createSlice({
  name: "documentComplectSettings",
  initialState,
  reducers: {
    setFetchedRegions: (
      state: StateType,
      action: PayloadAction<{
        regions: Array<RegionType>;
      }>,
    ) => {
      const payload = action.payload;
      const resultRegions = payload.regions.map((region) => ({
        ...region,
        id: region.number,
      }));
      state[GLOBAL_STATE_PROP.REGION].name = "Регион";
      state[GLOBAL_STATE_PROP.REGION].values = resultRegions;
    },

    setCurrent: (
      state: StateType,
      action: PayloadAction<{
        type: GLOBAL_STATE_PROP;
        valueId: number;
      }>,
    ) => {
      const payload = action.payload;
      const currentItem = state[payload.type].values.find(
        (value) => value.id === payload.valueId,
      );
      if (currentItem) {
        // @ts-ignore
        state.current[payload.type] = currentItem;
      }
    },
  },
});

export const documentComplectSettingsReducer =
  documentComplectSettingsSlice.reducer;

// Экспорт actions
export const documentComplectSettingsActions =
  documentComplectSettingsSlice.actions;
