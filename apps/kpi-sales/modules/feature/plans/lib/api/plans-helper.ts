import { getSalesPlans } from '@workspace/nest-kpi-report-sales-api';
import type {
    PlanIndicatorMeta,
    PlansConfig,
    PlanTargetSaveItem,
    PlanTargetsByCode,
} from '../../model';

/**
 * Обёртка generated-клиента планов — ЕДИНСТВЕННОЕ место импорта
 * @workspace/nest-kpi-report-sales-api в фиче (правило CLAUDE.md).
 */
export class PlansHelper {
    private api: ReturnType<typeof getSalesPlans>;

    constructor() {
        this.api = getSalesPlans();
    }

    /** Каталог показателей + конфиг портала. */
    async getConfig(domain: string): Promise<{
        catalog: PlanIndicatorMeta[];
        config: PlansConfig;
    }> {
        const response = await this.api.plansGetConfig({ domain });
        return {
            catalog: response.catalog as PlanIndicatorMeta[],
            config: response.config as PlansConfig,
        };
    }

    async saveConfig(
        domain: string,
        config: PlansConfig,
    ): Promise<PlansConfig> {
        const response = await this.api.plansSaveConfig({ domain, config });
        return response.config as PlansConfig;
    }

    /** Планы сотрудников: userId → (code → значение|null). */
    async getTargets(
        domain: string,
        userIds: number[],
    ): Promise<Record<number, PlanTargetsByCode>> {
        if (!userIds.length) return {};
        const response = await this.api.plansGetTargets({ domain, userIds });
        return Object.fromEntries(
            (response.targets ?? []).map(user => [
                user.userId,
                Object.fromEntries(
                    user.values.map(item => [item.code, item.value]),
                ),
            ]),
        );
    }

    async saveTargets(
        domain: string,
        targets: PlanTargetSaveItem[],
    ): Promise<void> {
        if (!targets.length) return;
        await this.api.plansSaveTargets({ domain, targets });
    }
}
