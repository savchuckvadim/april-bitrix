import {
    customAxios,
    getAdminSmartsManagement,
    type SmartResponseDto,
} from '@workspace/nest-admin-api';
import type {
    InstallAicallResult,
    InstallConstSmartResult,
    SmartDetailsResponse,
    SmartRegistryResponse,
} from '../../model';

const SMARTS_URL = '/api/admin/pbx/smarts';

/**
 * Обёртка над admin-API смартов портала (таблица `smarts`). Список — через
 * сгенерированный orval-клиент; новые эндпоинты деталей и установки AI-смарта
 * ходят через тот же `customAxios` и описаны ручными типами в `model` до
 * перегенерации клиента.
 */
export class SmartsAdminHelper {
    private api = getAdminSmartsManagement();

    /** Все смарты портала одним запросом — без серверных параметров фильтра. */
    getPortalSmarts(portalId: number): Promise<SmartResponseDto[]> {
        return this.api.smartGetAllSmarts({ portal_id: String(portalId) });
    }

    /** Детали смарта: строка `smarts` + живое состояние в Bitrix (fail-open). */
    getDetails(smartId: number): Promise<SmartDetailsResponse> {
        return customAxios<SmartDetailsResponse>({
            url: `${SMARTS_URL}/${smartId}/details`,
            method: 'GET',
        });
    }

    /**
     * Идемпотентная установка смарта «AI-анализ звонков». Установка идёт в
     * Bitrix и может занимать до 2 минут — дефолтных 30с инстанса axios мало,
     * поэтому таймаут поднят per-request.
     */
    installAicall(domain: string): Promise<InstallAicallResult> {
        return customAxios<InstallAicallResult>({
            url: `${SMARTS_URL}/install-aicall`,
            method: 'POST',
            data: { domain },
            timeout: 180_000,
        });
    }

    /** Реестр const-смартов, доступных к установке из констант. */
    getRegistry(): Promise<SmartRegistryResponse> {
        return customAxios<SmartRegistryResponse>({
            url: `${SMARTS_URL}/registry`,
            method: 'GET',
        });
    }

    /**
     * Идемпотентная установка const-смарта по `kind` из реестра. Как и
     * install-aicall, идёт в Bitrix и может занимать до 2 минут — таймаут
     * поднят per-request.
     */
    installConst(kind: string, domain: string): Promise<InstallConstSmartResult> {
        return customAxios<InstallConstSmartResult>({
            url: `${SMARTS_URL}/install-const`,
            method: 'POST',
            data: { kind, domain },
            timeout: 180_000,
        });
    }
}
