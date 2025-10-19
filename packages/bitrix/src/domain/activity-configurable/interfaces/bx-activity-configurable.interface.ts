import { BitrixOwnerTypeId } from "../../enums/bitrix-constants.enum";



export interface IBXActivityConfigurable {
    [key: string]: any;
    responsibleId: number;
    deadline: string;
    completed: 'N' | 'Y';
    pingOffset: PingOffset[];

}

export type PingOffset = 0 | 5 | 15 | 30 | 60;


export interface IBXActivityConfigurableAddRequest {
    ownerTypeId: BitrixOwnerTypeId,
    ownerId: number,
    fields: IBXActivityConfigurable,
    layout: object,

}
