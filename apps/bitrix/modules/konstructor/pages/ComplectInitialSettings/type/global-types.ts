export type RegionType = {
    number: number
    name: string
    title: string
    abs: number
}


export type GlobalSupplyTypesType = GlobalSupplyTypesEnum.INTERNET | GlobalSupplyTypesEnum.PROXIMA
export enum GlobalSupplyTypesEnum {
    INTERNET = 'Интернет',
    PROXIMA = 'Проксима'
}


export type GlobalComplectTypesType = GlobalComplectTypesEnum.UNIVERSAL | GlobalComplectTypesEnum.PROF
export enum GlobalComplectTypesEnum {
    UNIVERSAL = 'Универсальная линейка',
    PROF = 'ПРОФ'
} 


export type GlobalItem ={
    id: number
    title: string
}