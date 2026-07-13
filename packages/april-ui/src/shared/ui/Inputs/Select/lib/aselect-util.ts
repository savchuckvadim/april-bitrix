import { GroupConfig, HasID, HasId, Selectable } from "../aselect-type";

export const getGroupConfig = <T extends Selectable>(item: any): GroupConfig<T> | null => {
  return groupConfigs.find((config: GroupConfig<any>) => config.isType(item)) || null;
};

// Конфигурация для групп
const groupConfigs: GroupConfig<any>[] = [
    {
        isType: (item: any): item is HasId => item && item.id !== undefined,
        getId: (item: HasId) => item.id,
        getName: (item: HasId) => item.name,
    },
    {
        isType: (item: any): item is HasID => item && item.ID !== undefined,
        getId: (item: HasID) => item.ID,
        getName: (item: HasID) => item.NAME,
    },
];
