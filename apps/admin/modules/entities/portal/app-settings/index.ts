/** Публичная поверхность настроек приложений портала. */
export { PortalAppSettingsPanel } from './ui/PortalAppSettingsPanel/PortalAppSettingsPanel';
export {
    usePortalAppSettings,
    useSavePortalAppSettings,
} from './lib/hooks/use-app-settings';
export { PORTAL_APP_CODE } from './model';
export type {
    PortalAppCode,
    PortalAppSettingOption,
    PortalAppSettingValue,
    PortalAppSettingsBlock,
} from './model';
export { formatSettingList, parseSettingList } from './lib/setting-list';
export { PORTAL_APP_TITLE } from './consts/app-settings.const';
