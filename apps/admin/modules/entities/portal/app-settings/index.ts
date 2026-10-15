/** Публичная поверхность настроек приложений портала. */
export { PortalAppSettingsPanel } from './ui/PortalAppSettingsPanel/PortalAppSettingsPanel';
export {
    usePortalAppSettings,
    useSavePortalAppSettings,
} from './lib/hooks/use-app-settings';
export { PORTAL_APP_CODE } from './model';
export type {
    PortalAppCode,
    PortalAppSettingDescriptor,
    PortalAppSettingOption,
    PortalAppSettingValue,
    PortalAppSettingsBlock,
} from './model';
// Поле одной настройки — переиспользуется карточкой хука (правка настроек
// хука прямо на его странице, с той же семантикой черновика).
export { AppSettingField } from './ui/PortalAppSettingsPanel/components/AppSettingField';
export { formatSettingList, parseSettingList } from './lib/setting-list';
export { PORTAL_APP_TITLE } from './consts/app-settings.const';
