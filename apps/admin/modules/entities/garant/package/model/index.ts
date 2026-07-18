import type {
    PackageCreateDto,
    PackageUpdateDto,
    PackageTypeEnum,
    PackageProductTypeEnum,
    PackageEntityDto,
} from '@workspace/nest-admin-api';


export interface IGarantPackage extends PackageEntityDto {};

export interface IGarantPackageCreate extends PackageCreateDto { };

export interface IGarantPackageUpdate extends PackageUpdateDto { };


export type GarantPackageTypeEnum = PackageTypeEnum;

export type GarantPackageProductTypeEnum = PackageProductTypeEnum;

