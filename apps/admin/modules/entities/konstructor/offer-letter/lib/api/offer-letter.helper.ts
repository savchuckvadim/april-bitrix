import { customAxios } from '@workspace/nest-admin-api';
import {
    OFFER_LETTERS_API_BASE,
    OFFER_LETTERS_IMPORT_URL,
} from '../../consts/offer-letter.consts';
import type {
    OfferLetter,
    OfferLetterCreate,
    OfferLetterDeleted,
    OfferLetterUpdate,
    OfferLettersImportRequest,
    OfferLettersImportResponse,
} from '../../model';

/**
 * Транспорт писем КП. Руками, пока не прогнан `pnpm run generate`: тот же
 * мутатор `customAxios`, что у сгенерированных клиентов, поэтому после
 * генерации меняются только тела методов.
 */
export class OfferLetterHelper {
    list(portalId: number): Promise<OfferLetter[]> {
        return customAxios<OfferLetter[]>({
            url: OFFER_LETTERS_API_BASE,
            method: 'GET',
            params: { portalId },
        });
    }

    create(dto: OfferLetterCreate): Promise<OfferLetter> {
        return customAxios<OfferLetter>({
            url: OFFER_LETTERS_API_BASE,
            method: 'POST',
            data: dto,
        });
    }

    update(id: string, dto: OfferLetterUpdate): Promise<OfferLetter> {
        return customAxios<OfferLetter>({
            url: `${OFFER_LETTERS_API_BASE}/${id}`,
            method: 'PATCH',
            data: dto,
        });
    }

    setDefault(id: string): Promise<OfferLetter> {
        return customAxios<OfferLetter>({
            url: `${OFFER_LETTERS_API_BASE}/${id}/default`,
            method: 'POST',
        });
    }

    remove(id: string): Promise<OfferLetterDeleted> {
        return customAxios<OfferLetterDeleted>({
            url: `${OFFER_LETTERS_API_BASE}/${id}`,
            method: 'DELETE',
        });
    }

    /** Временная ручка переноса: после переноса удаляется вместе с кнопкой */
    importLegacy(dto: OfferLettersImportRequest): Promise<OfferLettersImportResponse> {
        return customAxios<OfferLettersImportResponse>({
            url: OFFER_LETTERS_IMPORT_URL,
            method: 'POST',
            data: dto,
        });
    }
}
