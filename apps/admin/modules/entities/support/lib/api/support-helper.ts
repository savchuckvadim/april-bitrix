import { customAxios } from '@workspace/nest-admin-api';
import type { SupportGuide, SupportMonitorPreview } from '../../model';

const GUIDE_API = '/api/admin/support/guide';
const PREVIEW_API = '/api/admin/support-monitor/preview';

/**
 * Транспорт раздела «Поддержка клиентов» (`SupportGuideAdminController`,
 * `SupportMonitorAdminController` бэка admin). Вызовы ручные через
 * `customAxios` — тот же mutator, что у сгенерированного клиента: снимает
 * конверт `{ resultCode, data }`.
 */
export class SupportHelper {
    /** Путеводитель и чек-лист готовности портала линии. */
    getGuide(domain?: string): Promise<SupportGuide> {
        return customAxios<SupportGuide>({
            url: GUIDE_API,
            method: 'GET',
            params: domain ? { domain } : undefined,
        });
    }

    /** Что бот отправил бы прямо сейчас: только чтение, ничего не шлёт. */
    preview(domain: string): Promise<SupportMonitorPreview> {
        return customAxios<SupportMonitorPreview>({
            url: PREVIEW_API,
            method: 'POST',
            data: { domain },
        });
    }
}
