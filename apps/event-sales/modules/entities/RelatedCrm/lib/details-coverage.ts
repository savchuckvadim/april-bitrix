import type { RelatedCrmDetails } from '../model';
import type { RelatedCrmState } from '../model/RelatedCrmSlice';
import type { EntityDescriptor } from './entity-descriptor';

/**
 * Покрывает ли стор связей (relatedCrm) нужду конкретного потребителя.
 *
 * Ключ запроса — единый формат с RelatedCrmThunk (дедуп и latest-wins там
 * сверяются той же строкой): собери его иначе — и переиспользование ответа
 * молча перестанет находить готовые данные.
 *
 * «Полный граф» — ответ с includeClosed:true: истории нужны и закрытые
 * сделки (их ленты — самая ценная часть архива), открытого графа ей мало.
 */
export const buildDetailsKey = (
    entityType: string,
    entityId: number,
    includeClosed: boolean,
): string => `${entityType}:${entityId}:${includeClosed ? 'all' : 'open'}`;

const fullGraphKey = (descriptor: EntityDescriptor): string =>
    buildDetailsKey(descriptor.entityType, descriptor.entityId, true);

/** Готовый полный граф текущего контекста — или null, если стор не покрывает. */
export const getFullGraphDetails = (
    relatedCrm: RelatedCrmState,
    descriptor: EntityDescriptor,
): RelatedCrmDetails | null =>
    relatedCrm.status === 'ready' &&
    relatedCrm.details &&
    relatedCrm.key === fullGraphKey(descriptor)
        ? relatedCrm.details
        : null;

/** Полный граф текущего контекста прямо сейчас в полёте (запрос листенера). */
export const isFullGraphDetailsInFlight = (
    relatedCrm: RelatedCrmState,
    descriptor: EntityDescriptor,
): boolean =>
    relatedCrm.status === 'loading' &&
    relatedCrm.key === fullGraphKey(descriptor);
