import { customAxios } from '@workspace/nest-admin-api';
import type {
    MethodologyPreviewStart,
    MethodologyPreviewState,
} from '../../model/methodology-preview';

const PREVIEW_URL = '/api/admin/methodologies/preview';

/**
 * Проверка черновика методики на одном звонке. Ручки новые — ходят через
 * `customAxios` admin-бэкенда с ручными типами до перегенерации клиента.
 */
export class MethodologyPreviewHelper {
    /** Ставит проверку в очередь; отвечает сразу состоянием «в очереди». */
    start(body: MethodologyPreviewStart): Promise<MethodologyPreviewState> {
        return customAxios<MethodologyPreviewState>({
            url: PREVIEW_URL,
            method: 'POST',
            data: body,
        });
    }

    /** Состояние и итог проверки по номеру из ответа на запуск. */
    state(previewId: string): Promise<MethodologyPreviewState> {
        return customAxios<MethodologyPreviewState>({
            url: PREVIEW_URL,
            method: 'GET',
            params: { previewId },
        });
    }
}
