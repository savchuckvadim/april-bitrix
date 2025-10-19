import { BitrixEntityType } from "../../../enums/bitrix-constants.enum";

export interface IBXTimelineComment {
    ID?: number | string;
    ENTITY_ID: number | string;
    ENTITY_TYPE: BitrixEntityType | string;
    COMMENT: string;
    AUTHOR_ID: string;
    FILES?: [['file name', 'file content'], ['file name', 'file content']];
}
