import type {
    ERQAddressItem,
    ERQBankItem,
    ERQField,
    ERQItem,
    Erqdto,
    RqCaseRequestDto,
    RqStoreRq200,
    StoreRqRequestDto,
} from '@workspace/nest-konstructor-api';

/**
 * Транспортные формы бэка `rq/*` под стабильными именами слайса: при
 * переименовании DTO на бэке правится только этот файл. Доменные типы (union
 * полей по `type`) — в `./types`, переход — `lib/adapters/rq-dto.adapter.ts`.
 */
export type RqBundleDto = Erqdto;
export type RqRecordDto = ERQItem;
export type RqFieldDto = ERQField;
export type RqAddressItemDto = ERQAddressItem;
export type RqBankItemDto = ERQBankItem;
export type RqStoreRequest = StoreRqRequestDto;
export type RqStoreResponse = RqStoreRq200;
export type RqCaseRequest = RqCaseRequestDto;
export type RqCaseKind = NonNullable<RqCaseRequestDto['kind']>;
