export * from './Tooltip';
export * from './Tables/RTable';

// Единый реестр тонов дизайн-системы (только токены тем)
export * from './lib/tones';

// Легаси-слой имён цветов поверх тонов (@deprecated, см. lib/intents.ts)
export * from './lib/intents';

// Ported event component library (legacy @packages/ui)
export { default as Page } from './shared/ui/Page/Page';
export { default as ASelect } from './shared/ui/Inputs/Select/ASelect';
export { default as EVCard } from './shared/ui/Cards/EventEntityCard/EventCard';
export { default as EventCardAction } from './shared/ui/Cards/EventEntityCard/CardAction';
export { default as AInput } from './shared/ui/Inputs/Input/AInput';
export { default as ADate } from './shared/ui/Inputs/Date/ADate';
export { default as AText } from './shared/ui/Inputs/Text/AText';
export { default as ACheckboxGroup } from './shared/ui/Inputs/CheckboxGroup/ACheckboxGroup';
export { default as ABadge } from './shared/ui/Badge/ABadge';
export { default as AButton } from './shared/ui/Button/AAButton';
export { default as AModal } from './shared/ui/Modal/Modal';
export { default as ALink } from './shared/ui/Link/Link';
export { default as ATogglerColor } from './shared/ui/Toggler/Color/ATogglerColor';
export { default as APhoneInput } from './shared/ui/Inputs/Input/APhoneInput';
export { default as ALabel } from './shared/ui/Inputs/Label/ALabel';
// Поверхности: единственная карточка для приложений
export * from './surfaces';

// Бэйджи на реестре тонов
export * from './badges';

// Поля формы
export * from './fields';

// Состояния загрузки: спиннер, boot-прелоадер, экран сборки отчёта
export * from './feedback';

export { PreloaderCard } from './shared/Preloader';
export { PreloaderMicro } from './shared/Preloader';
export { PreloaderScreen } from './shared/Preloader';
export type { PreloaderVariant } from './shared/Preloader';
// Стекло: выключатель на всю монорепу (data-glass / --fx-glass)
export { useGlass } from './lib/glass/use-glass';
export type { UseGlassResult } from './lib/glass/use-glass';
export { GlassToggle } from './lib/glass/GlassToggle';
export {
    getGlassPreference,
    setGlassPreference,
} from './lib/glass/glass-preference';
export type { GlassPreference } from './lib/glass/glass-preference';

export { GlassCard } from './shared/ui/Glass/GlassCard';
export type { GlassCardProps } from './shared/ui/Glass/GlassCard';
export { GlassSurface } from './shared/ui/Glass/GlassSurface';
export type { GlassSurfaceProps } from './shared/ui/Glass/GlassSurface';
export { GlassAmbient } from './shared/ui/Glass/GlassAmbient';
export { LiquidProgress } from './shared/ui/Progress/LiquidProgress';
export type {
    LiquidProgressProps,
    LiquidProgressTone,
} from './shared/ui/Progress/LiquidProgress';

export type { ComponentPropsColors } from './shared/ui/Button/AAButton';
export { default as AIcon } from './shared/FuncIcon/FuncIcon';

// Бэйджи событий (event-sales / event-service, токены april-tokens.css)
export { EventTypeBadge } from './shared/ui/EventBadge/EventTypeBadge';
export { EventStatusBadge } from './shared/ui/EventBadge/EventStatusBadge';
export * from './shared/ui/EventBadge/event-badge-maps';
