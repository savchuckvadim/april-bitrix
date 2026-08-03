import type {
    DuplicateCandidateDto,
    DuplicateDetailsRequestDto,
    DuplicateDetailsResponseDto,
    DuplicateMatchReasonDto,
    DuplicateRawSignalsDto,
    DuplicateSignalsDto,
    RelatedDealDto,
    RelatedLeadDto,
    RelatedStageDto,
    ResponsibleUserDto,
    SearchDuplicatesRequestDto,
    SearchDuplicatesResponseDto,
} from '@workspace/nest-event-sales-api';
import {
    DuplicateCandidateDtoEntityType,
    SearchDuplicatesRequestDtoLevel,
} from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md): бэкенд
// переименует поле — правится только этот файл.
export type DuplicateCandidate = DuplicateCandidateDto;
export type DuplicateMatchReason = DuplicateMatchReasonDto;
export type DuplicateSignals = DuplicateSignalsDto;
export type DuplicateRawSignals = DuplicateRawSignalsDto;
export type DuplicateSearchRequest = SearchDuplicatesRequestDto;
export type DuplicateSearchResponse = SearchDuplicatesResponseDto;
export type DuplicateDetailsRequest = DuplicateDetailsRequestDto;
export type DuplicateDetails = DuplicateDetailsResponseDto;
export type RelatedDeal = RelatedDealDto;
export type RelatedLead = RelatedLeadDto;
export type RelatedStage = RelatedStageDto;
export type ResponsibleUser = ResponsibleUserDto;

export const DUPLICATE_ENTITY_TYPE = DuplicateCandidateDtoEntityType;
export type DuplicateEntityType = DuplicateCandidateDtoEntityType;

export const DUPLICATE_SEARCH_LEVEL = SearchDuplicatesRequestDtoLevel;
export type DuplicateSearchLevel = SearchDuplicatesRequestDtoLevel;

/** Статус запроса — панель рисует по нему, а не по набору булевых флагов. */
export type DuplicatesStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Ключ кандидата: тип + id. Одного id мало — лид 10 и компания 10 разные. */
export const duplicateKey = (
    candidate: Pick<DuplicateCandidate, 'entityType' | 'id'>,
): string => `${candidate.entityType}_${candidate.id}`;
