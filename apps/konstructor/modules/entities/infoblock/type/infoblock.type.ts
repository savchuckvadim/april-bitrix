export interface IServerInfoBlock {
    //инфоблок с сервера
    id: number;
    name: string;
    title: string;
    code: string;
    groupId: number;
    description: string;
    descriptionForSale: string;
    shortDescription: string;
    group?: IInfoBlockGroup;
}

export interface IInfoBlock extends IServerInfoBlock {
    // Инфоблок для APP
    checked: boolean;
}
export interface IInfoBlockGroup {
    id: number;
    code: string;
    name: string;
    title: string;
    type: string;
    infoblocks: IInfoBlock[];
}
