import { TDealData, TParticipantData } from '../type/deal-field.type';

/**
 * Field-code keys for the seminar deal, ported off the removed `@alfa/entities`.
 * Extend as more codes are needed.
 */
export enum BxDealDataKeys {
    organization_type = 'organization_type',
    participants = 'participants',
}

export enum BxParticipantsDataKeys {
    format = 'format',
    format_v2 = 'format_v2',
    days = 'days',
}

/**
 * TODO(@alfa/entities migration): the real seminar field configuration object
 * lived in the now-removed `@alfa/entities` package and has no frontend source.
 * Stubbed empty so the (currently unwired) deal field/listener code compiles.
 * Populate this — or point it at the real config — before enabling
 * `getDealFieldsData` and the client-type listener.
 */
export const BxDealData = {} as TDealData & {
    [BxDealDataKeys.participants]?: Record<number, TParticipantData>;
};
