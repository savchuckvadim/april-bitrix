export const APP_GROUPS = {
    SALES: 'sales',
    SERVICE: 'service',
    MARKETING: 'marketing',
    SUPPORT: 'support',
    ANALYTICS: 'analytics'
} as const;

export const APP_TYPES = {
    WIDGET: 'widget',
    WEBHOOK: 'webhook',
    INTEGRATION: 'integration'
} as const;

export const PLACEMENT_TYPES = {
    CRM_TAB: 'crm_tab',
    CRM_BUTTON: 'crm_button',
    CRM_MENU: 'crm_menu',
    CRM_WIDGET: 'crm_widget',
    WEBHOOK: 'webhook'
} as const;

export const STATUSES = {
    NOT_INSTALLED: 'not_installed',
    INSTALLING: 'installing',
    INSTALLED: 'installed',
    ERROR: 'error'
} as const;
