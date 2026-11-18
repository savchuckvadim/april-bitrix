import { customAxios } from '@workspace/nest-admin-api';
import { DEAL_MOVEMENT_URL } from '../../consts/deal-movement.const';
import type {
    DealMovementProbeRunResult,
    DealMovementProbeStatus,
    DealMovementRunResult,
    DealMovementState,
} from '../../model';

/**
 * Транспорт карточки «Движение сделок». Руками, пока ручки не попали в
 * сгенерированный клиент: тот же мутатор `customAxios`, что у
 * сгенерированных (образец — кнопка аудита сделок).
 */
export class DealMovementHelper {
    /** Поставить прогон: dryRun — подсчёт без сохранения. */
    run(domain: string, dryRun: boolean): Promise<DealMovementRunResult> {
        return customAxios<DealMovementRunResult>({
            url: DEAL_MOVEMENT_URL.run,
            method: 'POST',
            data: { domain, dryRun },
        });
    }

    /** Включён ли счёт, ход прогона и последний сохранённый счёт. */
    status(domain: string): Promise<DealMovementState> {
        return customAxios<DealMovementState>({
            url: DEAL_MOVEMENT_URL.status,
            method: 'GET',
            params: { domain },
        });
    }

    /** Поставить проверку записи в ленту на одной сделке (пишет в портал). */
    probe(domain: string, dealId: number): Promise<DealMovementProbeRunResult> {
        return customAxios<DealMovementProbeRunResult>({
            url: DEAL_MOVEMENT_URL.probe,
            method: 'POST',
            data: { domain, dealId },
        });
    }

    /** Идёт ли проверка и итог последней. */
    probeStatus(domain: string): Promise<DealMovementProbeStatus> {
        return customAxios<DealMovementProbeStatus>({
            url: DEAL_MOVEMENT_URL.probe,
            method: 'GET',
            params: { domain },
        });
    }
}
