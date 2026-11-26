import {
    getKonstructor,
    type OfferWordMultiGenerateDto,
    type OfferWordMultiGenerateResponseDto,
} from '@workspace/nest-konstructor-api';
import type { OfferSalesFlowFields } from '../../model/types';

/** Единственное место со сгенерированным клиентом генерации КП. */
export class OfferDocumentHelper {
    private api = getKonstructor();

    /**
     * generate-multi: operationId джобы (очередь) либо готовые ссылки (withoutQueue).
     * Поля потока продаж в сгенерированном типе пока не описаны.
     */
    async generate(request: OfferWordMultiGenerateDto & OfferSalesFlowFields): Promise<OfferWordMultiGenerateResponseDto> {
        return this.api.offerWordMultiGenerateGenerateOfferWordMulti(request);
    }
}
