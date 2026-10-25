import { getKonstructorDealSend, type DealSendResponseDto } from '@workspace/nest-konstructor-api';
import type { DealSendRequest } from '../build-deal-send.util';

/** POST konstructor/deal-send — ЕДИНСТВЕННОЕ место импорта api-пакета для фичи. */
export class DealSendHelper {
    private api = getKonstructorDealSend();

    async send(request: DealSendRequest): Promise<DealSendResponseDto> {
        return this.api.dealSendSend(request);
    }
}
