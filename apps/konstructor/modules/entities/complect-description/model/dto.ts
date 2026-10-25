import type {
    ComplectDescriptionGenerateDto,
    ComplectDescriptionGroupDto,
    ComplectDescriptionInfoblockDto,
    ComplectDescriptionResponseDto,
} from '@workspace/nest-konstructor-api';

/** Запрос «Описание комплекта» (бэк complect-description/generate) */
export type ComplectDescriptionRequest = ComplectDescriptionGenerateDto;
export type ComplectDescriptionGroup = ComplectDescriptionGroupDto;
export type ComplectDescriptionInfoblock = ComplectDescriptionInfoblockDto;
export type ComplectDescriptionResponse = ComplectDescriptionResponseDto;
