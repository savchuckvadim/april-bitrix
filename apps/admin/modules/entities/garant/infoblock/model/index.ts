import {
    GetInfoblockLightResponseDto,
    InfoblockResponseDto,
    CreateInfoblockDto,
    AddInfoblockPackagesDto,
    AddInfoblockToPackagesDto,
    InfoblockEntityDto,
} from '@workspace/nest-api';

import {  SetInfoblockExcludedDto, SetInfoblockGroupDto } from "@workspace/nest-api";
import {  RemoveInfoblockFromPackagesDto, RemoveInfoblockPackagesDto, SetInfoblockInPackagesDto, SetInfoblockPackagesDto } from "@workspace/nest-api";

/**
 * Маппинг типов инфоблоков для удобства использования
 *
 * InfoblockListItem - легкая версия без связей (используется в списках)
 * InfoblockResponseDto - полная версия со всеми связями (используется при получении одного инфоблока)
 */
export type {
    GetInfoblockLightResponseDto,
    InfoblockResponseDto,
    CreateInfoblockDto,
};

/**
 * Тип для списка инфоблоков (легкая версия)
 */
export type InfoblockListItem = InfoblockEntityDto;

/**
 * Тип для детального просмотра инфоблока (полная версия)
 */
export type InfoblockDetail = InfoblockResponseDto;

/**
 *  Тип для создания инфоблока
 *
 */
export type InfoblockCreateDto = CreateInfoblockDto;

// Relations
export type InfoblockExcludedSetDto = SetInfoblockExcludedDto;
export type InfoblockGroupSetDto = SetInfoblockGroupDto;

// Packages
export type InfoblockPackagesAddDto = AddInfoblockPackagesDto;
export type InfoblockPackagesAddToPackagesDto = AddInfoblockToPackagesDto;
export type InfoblockPackagesRemoveDto = RemoveInfoblockPackagesDto;
export type InfoblockPackagesRemoveFromPackagesDto = RemoveInfoblockFromPackagesDto;
export type InfoblockPackagesSetDto = SetInfoblockPackagesDto;
export type InfoblockPackagesInPackagesSetDto = SetInfoblockInPackagesDto;
