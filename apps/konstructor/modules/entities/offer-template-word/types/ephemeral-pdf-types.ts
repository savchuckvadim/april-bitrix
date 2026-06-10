import type {
    OfferWordEphemeralPdfPollResponseDto,
    OfferWordEphemeralPdfStartResponseDto,
    OfferWordEphemeralPdfStopResponseDto,
} from '@workspace/nest-api';

export enum OfferWordEphemeralPdfStatusEnum {
    PENDING = 'pending',
    READY = 'ready',
    FAILED = 'failed',
}

export interface OfferWordEphemeralPdfStartResponse extends OfferWordEphemeralPdfStartResponseDto {}

export interface OfferWordEphemeralPdfStopResponse extends OfferWordEphemeralPdfStopResponseDto {}

export type OfferWordEphemeralPdfPollResponse = OfferWordEphemeralPdfPollResponseDto;
