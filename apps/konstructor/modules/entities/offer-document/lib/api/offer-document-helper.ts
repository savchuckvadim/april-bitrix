import {
    getKonstructor,
    type OfferWordMultiGenerateDto,
    type OfferWordMultiGenerateResponseDto,
} from '@workspace/nest-konstructor-api';

/** Единственное место со сгенерированным клиентом генерации КП. */
export class OfferDocumentHelper {
    private api = getKonstructor();

    /** generate-multi: operationId джобы (очередь) либо готовые ссылки (withoutQueue) */
    async generate(request: OfferWordMultiGenerateDto): Promise<OfferWordMultiGenerateResponseDto> {
        return this.api.offerWordMultiGenerateGenerateOfferWordMulti(request);
    }
}
