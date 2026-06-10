import type {
    BitrixFieldResponseDto,
    CreateBitrixFieldDto,
    CreateBitrixFieldsBulkDto,
    UpdateBitrixFieldDto,
    GetFieldsByEntityRequestDtoEntityType,
    GetChildrenByPbxEntityDto,
} from '@workspace/nest-api';


export type PbxField = BitrixFieldResponseDto;
export type PbxCreateFieldDto = CreateBitrixFieldDto;
export type PbxCreateFieldsBulkDto = CreateBitrixFieldsBulkDto;
export type PbxUpdateFieldDto = UpdateBitrixFieldDto;
export type PbxGetFieldsByEntityDto = GetChildrenByPbxEntityDto;
export type PbxFieldEntityType = GetFieldsByEntityRequestDtoEntityType;
