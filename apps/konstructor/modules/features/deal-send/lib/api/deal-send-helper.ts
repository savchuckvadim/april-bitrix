import {
    getKonstructorDealSend,
    type DealSendResponseDto,
    type DealSendStatusResponseDto,
} from '@workspace/nest-konstructor-api';
import type { DealSendRequest } from '../build-deal-send.util';

/** konstructor/deal-send — ЕДИНСТВЕННОЕ место импорта api-пакета для фичи. */
export class DealSendHelper {
    private api = getKonstructorDealSend();

    /** POST konstructor/deal-send */
    async send(request: DealSendRequest): Promise<DealSendResponseDto> {
        return this.api.dealSendSend(request);
    }

    /** GET konstructor/deal-send/status/:operationId — итог записи полей и строк */
    async status(operationId: string): Promise<DealSendStatusResponseDto> {
        return this.api.dealSendStatus(operationId);
    }
}
