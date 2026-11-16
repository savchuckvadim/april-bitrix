import { customAxios } from '@workspace/nest-admin-api';
import { dealAuditRunNowUrl } from '../../consts/deal-audit-run.const';
import type { DealAuditRunNowResponse } from '../../model/deal-audit-run';

/**
 * Транспорт кнопки «Сформировать и отправить». Руками, пока не прогнан
 * `pnpm run generate`: тот же мутатор `customAxios`, что у сгенерированных
 * клиентов.
 */
export class DealAuditRunHelper {
    runNow(portalId: number): Promise<DealAuditRunNowResponse> {
        return customAxios<DealAuditRunNowResponse>({
            url: dealAuditRunNowUrl(portalId),
            method: 'POST',
        });
    }
}
