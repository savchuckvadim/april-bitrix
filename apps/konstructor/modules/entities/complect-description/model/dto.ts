import type {
    ComplectDescriptionGenerateDto,
    ComplectDescriptionGroupDto,
    ComplectDescriptionInfoblockDto,
    ComplectDescriptionResponseDto,
} from '@workspace/nest-konstructor-api';

/** Запрос «Описание комплекта» (бэк complect-description/generate) */
export type ComplectDescriptionRequest = ComplectDescriptionGenerateDto;
/** Содержимое документа: домен и пользователь нужны только хранилищу фрейма. */
export type ComplectDescriptionContent = Omit<
    ComplectDescriptionRequest,
    'domain' | 'userId'
>;
export type ComplectDescriptionGroup = ComplectDescriptionGroupDto;
export type ComplectDescriptionInfoblock = ComplectDescriptionInfoblockDto;
export type ComplectDescriptionResponse = ComplectDescriptionResponseDto;
