import { customAxios } from '@workspace/nest-admin-api';
import { OFFER_LETTERS_IMPORT_URL } from '../../consts/offer-letter.consts';
import type { OfferLettersImportRequest, OfferLettersImportResponse } from '../../model';

/**
 * Транспорт писем КП. Руками, пока не прогнан `pnpm run generate`: тот же
 * мутатор `customAxios`, что у сгенерированных клиентов.
 */
export class OfferLetterHelper {
    importLegacy(dto: OfferLettersImportRequest): Promise<OfferLettersImportResponse> {
        return customAxios<OfferLettersImportResponse>({
            url: OFFER_LETTERS_IMPORT_URL,
            method: 'POST',
            data: dto,
        });
    }
}
