import { CreateComplectDto, CreateComplectDtoProductType, CreateComplectDtoType, GetComplectResponseDto } from "@workspace/nest-api";

export const getToCreateComplect = (
    complect: GetComplectResponseDto,
    productType: CreateComplectDtoProductType,
    type: CreateComplectDtoType
): CreateComplectDto => {
    const result: CreateComplectDto = {
        name: complect.name,
        weight: complect.weight,
        abs: complect.abs,
        number: complect.number,
        isChanging: complect.isChanging,
        color: complect.color,
        withDefault: complect.withDefault,
        withLt: complect.withLt,
        withABS: complect.withABS,
        withConsalting: complect.withConsalting,
        withServices: complect.withServices,
        productType: complect.productType as CreateComplectDtoProductType,
        infoblockIds: [],
        fullName: complect.fullName,
        shortName: complect.shortName,
        code: complect.code,
        type: complect.type as CreateComplectDtoType,
    };
    return result;
};
