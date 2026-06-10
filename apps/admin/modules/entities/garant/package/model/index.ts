import type {
    PackageCreateDto,
    PackageUpdateDto,
    CreatePackageDtoType,
    CreatePackageDtoProductType,
    PackageEntityDto,
} from '@workspace/nest-api';


export interface IGarantPackage extends PackageEntityDto {};

export interface IGarantPackageCreate extends PackageCreateDto { };

export interface IGarantPackageUpdate extends PackageUpdateDto { };


export type GarantPackageTypeEnum = CreatePackageDtoType;

export type GarantPackageProductTypeEnum = CreatePackageDtoProductType;

