import { customAxios } from '@workspace/nest-kpi-report-sales-api';
import {
    PORTAL_VIEW_GET_URL,
    PORTAL_VIEW_SAVE_URL,
} from '../../consts/portal-view.consts';
import type {
    PortalViewRequest,
    PortalViewResponse,
    PortalViewSaveRequest,
} from '../../model/types';
import { normalizePortalViewResponse } from '../portal-view-normalize';

/**
 * Ручки вида отчёта новые — через `customAxios` (сессия портала, Bearer) с
 * ручными типами до перегенерации клиента. Общий конверт Nest снимает сам
 * `customAxios`; недостающие поля ответа добирает нормализация.
 */
const post = async <Body extends PortalViewRequest>(
    url: string,
    data: Body,
): Promise<PortalViewResponse> => {
    const raw = await customAxios<unknown>({
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
    });
    return normalizePortalViewResponse(raw);
};

/** Настройки вида отчёта портала. */
export const fetchPortalView = (
    request: PortalViewRequest,
): Promise<PortalViewResponse> => post(PORTAL_VIEW_GET_URL, request);

/** Сохранить изменённое; в ответе — настройки целиком, как после чтения. */
export const savePortalViewSettings = (
    request: PortalViewSaveRequest,
): Promise<PortalViewResponse> => post(PORTAL_VIEW_SAVE_URL, request);
