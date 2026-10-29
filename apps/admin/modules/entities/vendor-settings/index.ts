/** Публичная поверхность раздела «Настройки приложения». */
export { VendorSettingsPage } from './ui/VendorSettingsPage/VendorSettingsPage';
export {
    VENDOR_SETTINGS_KEY,
    useSaveVendorSetting,
    useVendorSettings,
} from './lib/hooks/use-vendor-settings';
export type { VendorSetting, VendorSettingGroup, VendorSettings } from './model';
