import { BitrixOwnerTypeId } from "../../../domain/enums/bitrix-constants.enum";



export class BXActivityConfigurableDto {
    [key: string]: any;
    responsibleId!: number;
    deadline!: string;
    completed!: 'N' | 'Y';
    pingOffset!: PingOffset[];

}

export type PingOffset = 0 | 5 | 15 | 30 | 60;


export class BXActivityConfigurableAddRequestDto {
    ownerTypeId!: BitrixOwnerTypeId;
    ownerId!: number;
    fields!: BXActivityConfigurableDto;
    layout!: object;
}
