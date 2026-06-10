import { PbxEntityTypePrisma } from '../../../../nest-api/src/generated/model/pbxEntityTypePrisma';
import { EUserFieldType } from '../../../../nest-api/src/generated/model/eUserFieldType';
import { PbxFieldEntityDto } from '../../../../nest-api/src/generated/model/pbxFieldEntityDto';
import { PbxFieldItemEntityDto } from '../../../../nest-api/src/generated/model/pbxFieldItemEntityDto';

// On the frontend the "DB"/source shapes are the orval-generated API DTOs,
// not Prisma rows. These aliases keep the mappers' vocabulary while pointing
// at the real frontend types.
export type PbxField = PbxFieldEntityDto;
export type PbxFieldItem = PbxFieldItemEntityDto;
export type PbxFieldWithItems = PbxFieldEntityDto;

export class PbxFieldEntity {
    id?: string;
    name: string;
    title: string;
    code: string;
    type: EUserFieldType;

    isPlural: boolean;
    bitrixId: string;
    bitrixCamelId: string;
    entity_id: number;
    entity_type: PbxEntityTypePrisma;
    parent_type: string;
    items: PbxFieldItemEntity[];
}

//actual type for install
export class PbxFieldItemEntity {
    id?: string;
    name: string;
    title: string;
    code: string;
    bitrixfield_id: number;
    bitrixId: number;
}
