import { BASE_PATH } from './base-path';

// Ссылки на портал (карточки CRM, задачи, внешние URL) живут в @workspace/bitrix —
// одни правила для всех приложений. Здесь — только пути самого приложения.
export {
    getCrmPath,
    getCrmUrl,
    getSafeExternalUrl,
    getTaskUrl,
    type CrmEntityKind,
} from '@workspace/bitrix';

/**
 * Внутренний путь приложения (страницы, статика) с учётом basePath.
 * Для `next/link` и `router.push` НЕ нужен — они префиксуют сами.
 */
export const getAppUrl = (path: string): string => {
    if (!path.startsWith('/')) return path;
    if (BASE_PATH && path.startsWith(`${BASE_PATH}/`)) return path;
    return `${BASE_PATH}${path}`;
};
