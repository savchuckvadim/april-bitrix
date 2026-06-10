import type {
    BtxCategoryResponseDto,
    CreateBtxCategoryDto,
    UpdateBtxCategoryDto,
    GetChildrenByPbxEntityDto,
    GetChildrenByPbxEntityDtoEntityType,
} from '@workspace/nest-api';

export type PbxCategory = BtxCategoryResponseDto;
export type PbxCreateCategoryDto = CreateBtxCategoryDto;
export type PbxUpdateCategoryDto = UpdateBtxCategoryDto;
export type PbxGetCategoriesByEntityDto = GetChildrenByPbxEntityDto;
export type PbxCategoryEntityType = GetChildrenByPbxEntityDtoEntityType;
