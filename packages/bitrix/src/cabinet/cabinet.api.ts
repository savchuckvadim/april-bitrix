import {
    frameAuthSource,
    pbxRequest,
    type PbxAuthSource,
} from '../marketplace/pbx-api.client';
import { siteAuthSource, siteSession } from './site-session.store';
import type {
    CabinetAddMember,
    CabinetBitrixAppCheck,
    CabinetBitrixAppConnection,
    CabinetBitrixAppKeys,
    CabinetFrameAccessStatus,
    CabinetInviteResult,
    CabinetMember,
    CabinetPasswordLinkState,
    CabinetPerson,
    CabinetPortalOverview,
    CabinetPortalSummary,
    CabinetProfile,
    CabinetTelegramBinding,
    CabinetTelegramCode,
} from './cabinet.types';

/**
 * API кабинета клиента (back/libs/cabinet на api.pbx). Одни и те же ручки
 * работают с сайта (вход по паролю) и из фрейма Битрикса (сессия фрейма):
 * источник токена выбирается сам — есть сессия сайта, значит сайт.
 */

const BASE = '/api/cabinet';

/** Сайт, если на нём вошли; иначе — сессия фрейма Битрикса. */
function auth(): PbxAuthSource {
    return siteSession.getSnapshot().status === 'ready' ||
        siteSession.getToken()
        ? siteAuthSource
        : frameAuthSource;
}

const get = <T>(path: string, authSource: PbxAuthSource = auth()) =>
    pbxRequest<T>({ method: 'GET', path: `${BASE}${path}`, authSource });

const post = <T>(path: string, body?: unknown) =>
    pbxRequest<T>({
        method: 'POST',
        path: `${BASE}${path}`,
        body,
        authSource: auth(),
    });

const put = <T>(path: string, body: unknown) =>
    pbxRequest<T>({
        method: 'PUT',
        path: `${BASE}${path}`,
        body,
        authSource: auth(),
    });

const del = <T>(path: string) =>
    pbxRequest<T>({ method: 'DELETE', path: `${BASE}${path}`, authSource: auth() });

// --- вход без сессии (сайт) ---

export const requestPasswordReset = (email: string) =>
    pbxRequest<{ ok: boolean }>({
        method: 'POST',
        path: `${BASE}/auth/forgot-password`,
        body: { email },
        anonymous: true,
    });

export const inspectPasswordLink = (token: string) =>
    pbxRequest<CabinetPasswordLinkState>({
        method: 'GET',
        path: `${BASE}/auth/password-link/${encodeURIComponent(token)}`,
        anonymous: true,
    });

export const setCabinetPassword = (token: string, password: string) =>
    pbxRequest<{ ok: boolean }>({
        method: 'POST',
        path: `${BASE}/auth/set-password`,
        body: { token, password },
        anonymous: true,
    });

// --- профиль и порталы ---

/** Профиль учётки — только для входа с сайта. */
export const getCabinetProfile = () => get<CabinetProfile>('/me', siteAuthSource);

export const listCabinetPortals = () => get<CabinetPortalSummary[]>('/portals');

export const getCabinetPortal = (portalId: number) =>
    get<CabinetPortalOverview>(`/portals/${portalId}`);

// --- участники (владелец) ---

export const listCabinetMembers = (portalId: number) =>
    get<CabinetMember[]>(`/portals/${portalId}/members`);

export const inviteCabinetMember = (portalId: number, payload: CabinetAddMember) =>
    post<CabinetInviteResult>(`/portals/${portalId}/members`, payload);

export const approveCabinetMember = (portalId: number, membershipId: string) =>
    post<CabinetMember>(`/portals/${portalId}/members/${membershipId}/approve`);

export const makeCabinetOwner = (portalId: number, membershipId: string) =>
    post<CabinetMember>(`/portals/${portalId}/members/${membershipId}/make-owner`);

export const revokeCabinetMember = (portalId: number, membershipId: string) =>
    del<{ ok: boolean }>(`/portals/${portalId}/members/${membershipId}`);

// --- доступ с сайта для сотрудника из фрейма ---

export const getFrameCabinetAccess = () =>
    get<CabinetFrameAccessStatus>('/frame/access', frameAuthSource);

export const requestFrameCabinetAccess = (person: CabinetPerson) =>
    pbxRequest<CabinetFrameAccessStatus>({
        method: 'POST',
        path: `${BASE}/frame/access-request`,
        body: person,
        authSource: frameAuthSource,
    });

// --- Telegram ---

export const issueTelegramCode = (portalId: number) =>
    post<CabinetTelegramCode>(`/portals/${portalId}/telegram/link-code`);

export const listTelegramBindings = (portalId: number) =>
    get<CabinetTelegramBinding[]>(`/portals/${portalId}/telegram/bindings`);

export const revokeTelegramBinding = (portalId: number, bindingId: string) =>
    del<{ ok: boolean }>(`/portals/${portalId}/telegram/bindings/${bindingId}`);

// --- Подключение Битрикс24 (владелец портала) ---

export const getBitrixAppConnection = (portalId: number) =>
    get<CabinetBitrixAppConnection>(`/portals/${portalId}/bitrix-app`);

export const saveBitrixAppKeys = (portalId: number, keys: CabinetBitrixAppKeys) =>
    put<CabinetBitrixAppConnection>(`/portals/${portalId}/bitrix-app/keys`, keys);

export const checkBitrixAppKeys = (portalId: number) =>
    post<CabinetBitrixAppCheck>(`/portals/${portalId}/bitrix-app/check`);
