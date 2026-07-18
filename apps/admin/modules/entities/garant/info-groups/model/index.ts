import {
    InfogroupResponseDto as ApiInfogroupResponseDto,
    InfogroupEntityDto,
    CreateInfogroupDto,
    CreateInfogroupDtoType,
    CreateInfogroupDtoProductType,
} from '@workspace/nest-admin-api';

/**
 * Маппинг типов групп инфоблоков для удобства использования
 *
 * InfogroupListItem - легкая версия без связей (используется в списках)
 * InfogroupResponseDto - полная версия со всеми связями (используется при получении одной группы)
 */
export type {
    CreateInfogroupDto,
};
export {
    CreateInfogroupDtoType,
    CreateInfogroupDtoProductType,
} from '@workspace/nest-admin-api';

/**
 * Тип для списка групп инфоблоков (легкая версия)
 */
export type InfogroupListItem = InfogroupEntityDto;

/**
 * Тип для детального просмотра группы инфоблоков (полная версия)
 * API возвращает InfogroupResponseDto, используем его напрямую
 */
export type InfogroupDetail = ApiInfogroupResponseDto;

/**
 * Тип для создания группы инфоблоков
 */
export type InfogroupCreateDto = CreateInfogroupDto;

/**
 * Основной тип ответа API - полная версия со всеми связями
 */
export type InfogroupResponseDto = ApiInfogroupResponseDto;
