import type { AuthData } from '@bitrix24/b24jssdk';
import type { BxFrameAuth } from '../dto/bx-frame-auth';

/**
 * Имя хоста портала из `AuthData.domain`. Во фрейме SDK кладёт туда origin
 * (`https://april.bitrix24.ru`, см. `getTargetOrigin()`), но на всякий
 * случай принимаем и голый хост, и хост с путём — наружу всегда `hostname`.
 */
export const portalHostname = (domain: string): string => {
    const raw = domain.trim();
    try {
        return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname;
    } catch {
        return raw.replace(/^[a-z]+:\/\//i, '').split(/[/:?#]/)[0] ?? raw;
    }
};

/**
 * Единственное место перевода `AuthData` SDK (snake_case, `[key]: any`)
 * в типизированный `BxFrameAuth`: пустые/нестроковые поля → null,
 * а не «undefined как строка».
 */
export const toBxFrameAuth = (authData: AuthData): BxFrameAuth => ({
    accessToken: authData.access_token,
    domain: portalHostname(authData.domain),
    memberId:
        typeof authData.member_id === 'string' && authData.member_id !== ''
            ? authData.member_id
            : null,
    expiresIn:
        typeof authData.expires_in === 'number' &&
        Number.isFinite(authData.expires_in)
            ? authData.expires_in
            : null,
});
