export interface HasId {
    id: number | string;
    name: string;
}

// Группа с полем `ID`
export interface HasID {
    ID: number | string;
    NAME: string;
}

// Универсальный интерфейс для поддержки всех групп
export type Selectable = HasId | HasID;


export type GroupConfig<T> = {
    isType: (item: any) => item is T; // Проверка, относится ли элемент к типу
    getId: (item: T) => number | string; // Получение идентификатора
    getName: (item: T) => string; // Получение имени
};

