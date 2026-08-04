import type {
    DuplicateDetailsRequestDto,
    DuplicateDetailsResponseDto,
    RelatedDealDto,
    RelatedLeadDto,
    RelatedStageDto,
    ResponsibleUserDto,
} from '@workspace/nest-event-sales-api';
import { DuplicateCandidateDtoEntityType } from '@workspace/nest-event-sales-api';

/**
 * Связи клиента в CRM: сделки, лиды, стадии, ответственные.
 *
 * Вынесено из фичи дублей отдельной сущностью: тем же ответом живёт и панель
 * дублей, и полноэкранная карточка клиента. На бэкенде это по-прежнему
 * `POST /duplicates/details` — историческое название эндпоинта, а не смысл
 * данных, поэтому доменные имена здесь свои.
 */
export type RelatedDeal = RelatedDealDto;
export type RelatedLead = RelatedLeadDto;
export type RelatedStage = RelatedStageDto;
export type ResponsibleUser = ResponsibleUserDto;

export type RelatedCrmRequest = DuplicateDetailsRequestDto;
export type RelatedCrmDetails = DuplicateDetailsResponseDto;

export const RELATED_ENTITY_TYPE = DuplicateCandidateDtoEntityType;
export type RelatedEntityType = DuplicateCandidateDtoEntityType;
