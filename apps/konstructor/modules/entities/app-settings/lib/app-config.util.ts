import type { KonstructorAppSettings } from '../model/dto';
import { DEFAULT_KONSTRUCTOR_APP_CONFIG, type KonstructorAppConfig } from '../model/types';

const asBoolean = (value: unknown, fallback: boolean): boolean =>
    typeof value === 'boolean' ? value : value === 'true' ? true : value === 'false' ? false : fallback;

/** Плоский ответ бэка → типизированный конфиг; незнакомые ключи игнорируются. */
export const toAppConfig = (settings: KonstructorAppSettings): KonstructorAppConfig => ({
    zakupkiEnabled: asBoolean(settings.zakupkiEnabled, DEFAULT_KONSTRUCTOR_APP_CONFIG.zakupkiEnabled),
});
