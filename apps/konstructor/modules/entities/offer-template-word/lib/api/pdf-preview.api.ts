import { getKonstructor, OfferWordEphemeralPdfPollResponseDto, OfferWordEphemeralPdfStartResponseDto, OfferWordEphemeralPdfStopResponseDto } from '@workspace/nest-konstructor-api';
import type { OfferWordPreviewRequest } from '../../model/preview-request';

export class OfferWordPdfPreviewAPI {
    private api: ReturnType<typeof getKonstructor>;
    constructor() {
        this.api = getKonstructor();
    }

    public async start(request: OfferWordPreviewRequest): Promise<OfferWordEphemeralPdfStartResponseDto> {
        return await this.api.offerWordPdfPreviewStartPreview(request);
    }

    public async getStatus(operationId: string): Promise<OfferWordEphemeralPdfPollResponseDto> {
        return await this.api.offerWordPdfPreviewGetPreviewStatus(operationId);
    }

    public async stop(operationId: string): Promise<OfferWordEphemeralPdfStopResponseDto> {
        return await this.api.offerWordPdfPreviewStopPreview(operationId);
    }

}

export const offerWordPdfPreviewHttp = new OfferWordPdfPreviewAPI();
