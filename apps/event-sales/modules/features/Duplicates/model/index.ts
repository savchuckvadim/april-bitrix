import type {
    DuplicateCandidateDto,
    DuplicateMatchReasonDto,
    DuplicateRawSignalsDto,
    DuplicateSignalsDto,
    JoinToMainItemResultDto,
    JoinToMainResultDto,
    JoinToMainRunDto,
    MergeDuplicatesResultDto,
    MergeDuplicatesRunDto,
    MergeGroupResultDto,
    SalesHookOperationDto,
    SearchDuplicatesRequestDto,
    SearchDuplicatesResponseDto,
} from '@workspace/nest-event-sales-api';
import { SearchDuplicatesRequestDtoLevel } from '@workspace/nest-event-sales-api';
import {
    RELATED_ENTITY_TYPE,
    type RelatedCrmDetails,
    type RelatedCrmRequest,
    type RelatedEntityType,
} from '@/modules/entities/RelatedCrm';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md): бэкенд
// переименует поле — правится только этот файл.
export type DuplicateCandidate = DuplicateCandidateDto;
export type DuplicateMatchReason = DuplicateMatchReasonDto;
export type DuplicateSignals = DuplicateSignalsDto;
export type DuplicateRawSignals = DuplicateRawSignalsDto;
export type DuplicateSearchRequest = SearchDuplicatesRequestDto;
export type DuplicateSearchResponse = SearchDuplicatesResponseDto;

// «Присоединить сюда»: сделка-дубль → в работу клиента (хук join-to-main).
export type JoinToMainRequest = JoinToMainRunDto;
export type JoinToMainResult = JoinToMainResultDto;
export type JoinToMainItemResult = JoinToMainItemResultDto;
export type SalesHookOperation = SalesHookOperationDto;

// «Объединить карточки»: слияние Битрикса (хук merge-duplicates, необратимо).
export type MergeCardsRequest = MergeDuplicatesRunDto;
export type MergeCardsResult = MergeDuplicatesResultDto;
export type MergeGroupResult = MergeGroupResultDto;

/** Объединение карточек: план → подтверждение → слияние → итог. */
export type MergeCardsStatus =
    | 'idle'
    | 'planning'
    | 'planned'
    | 'merging'
    | 'done'
    | 'error';

// Связи клиента — общая сущность: тем же ответом живёт полноэкранная карточка.
// Здесь только доменные имена фичи поверх неё, своих типов фича не заводит.
export type DuplicateDetailsRequest = RelatedCrmRequest;
export type DuplicateDetails = RelatedCrmDetails;
export type {
    RelatedDeal,
    RelatedLead,
    RelatedStage,
    ResponsibleUser,
} from '@/modules/entities/RelatedCrm';

export const DUPLICATE_ENTITY_TYPE = RELATED_ENTITY_TYPE;
export type DuplicateEntityType = RelatedEntityType;

export const DUPLICATE_SEARCH_LEVEL = SearchDuplicatesRequestDtoLevel;
export type DuplicateSearchLevel = SearchDuplicatesRequestDtoLevel;

/** Статус запроса — панель рисует по нему, а не по набору булевых флагов. */
export type DuplicatesStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Ключ кандидата: тип + id. Одного id мало — лид 10 и компания 10 разные. */
export const duplicateKey = (
    candidate: Pick<DuplicateCandidate, 'entityType' | 'id'>,
): string => `${candidate.entityType}_${candidate.id}`;
