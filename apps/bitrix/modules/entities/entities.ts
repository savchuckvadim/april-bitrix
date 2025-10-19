// Основные сущности системы

export interface Client {
    id: string;
    email: string;
    name: string;
    organization: string;
    portals: Portal[];
    createdAt: string;
}

export interface Portal {
    id: bigint;
    domain: string;
    name: string;
    isActive: boolean;
    bitrixApps: BitrixApp[];
    createdAt: Date;
}

export interface BitrixApp {
    id: bigint;
    portal_id: bigint;
    group: 'sales' | 'service' | 'marketing' | 'support' | 'analytics';
    type: 'widget' | 'webhook' | 'integration';
    code: string;
    status: 'not_installed' | 'installing' | 'installed' | 'error';
    portal?: Portal;
    bitrix_tokens?: BitrixToken;
    placements?: BitrixPlacement[];
    settings?: BitrixSetting[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BitrixToken {
    id: bigint;
    bitrix_app_id: bigint;
    client_id: string;
    client_secret: string;
    access_token: string;
    refresh_token: string;
    expires_at?: Date;
    application_token?: string;
    member_id?: string;
    bitrix_app?: BitrixApp;
    createdAt: Date;
    updatedAt: Date;
}

export interface BitrixPlacement {
    id: bigint;
    bitrix_app_id: bigint;
    code: string;
    type: 'crm_tab' | 'crm_button' | 'crm_menu' | 'crm_widget' | 'webhook';
    group: 'sales' | 'service' | 'marketing' | 'support' | 'analytics';
    status: 'not_installed' | 'installing' | 'installed' | 'error';
    bitrix_handler: string;
    public_handler: string;
    bitrix_codes: string;
    bitrix_app?: BitrixApp;
    settings?: BitrixSetting[];
    createdAt: Date;
    updatedAt: Date;
}

export interface BitrixSetting {
    id: bigint;
    entity_type: 'app' | 'placement';
    entity_id: bigint;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

// Дополнительные типы для UI

export interface WidgetComponent {
    name: string;
    status: 'completed' | 'error' | 'pending' | 'installing';
    progress: number;
    errorMessage?: string;
    description: string;
}

export interface PaymentInfo {
    plan: string;
    status: 'active' | 'expired' | 'trial' | 'cancelled';
    expiresAt: string;
    price: number;
    currency: string;
    isOverdue: boolean;
    overdueAmount?: number;
}

export interface Webhook {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'error';
    lastTriggered?: string;
    events: string[];
    bitrixAppId: bigint;
}

// Константы для групп и типов

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

// Хелперы для работы с данными

export const getAppGroupLabel = (group: string): string => {
    const labels = {
        [APP_GROUPS.SALES]: 'Продажи',
        [APP_GROUPS.SERVICE]: 'Сервис',
        [APP_GROUPS.MARKETING]: 'Маркетинг',
        [APP_GROUPS.SUPPORT]: 'Поддержка',
        [APP_GROUPS.ANALYTICS]: 'Аналитика'
    };
    return labels[group as keyof typeof labels] || group;
};

export const getAppTypeLabel = (type: string): string => {
    const labels = {
        [APP_TYPES.WIDGET]: 'Виджет',
        [APP_TYPES.WEBHOOK]: 'Вебхук',
        [APP_TYPES.INTEGRATION]: 'Интеграция'
    };
    return labels[type as keyof typeof labels] || type;
};

export const getStatusLabel = (status: string): string => {
    const labels = {
        [STATUSES.NOT_INSTALLED]: 'Не установлен',
        [STATUSES.INSTALLING]: 'Устанавливается',
        [STATUSES.INSTALLED]: 'Установлен',
        [STATUSES.ERROR]: 'Ошибка'
    };
    return labels[status as keyof typeof labels] || status;
};

export const getStatusColor = (status: string): string => {
    const colors = {
        [STATUSES.NOT_INSTALLED]: 'bg-gray-100 text-gray-800 border-gray-200',
        [STATUSES.INSTALLING]: 'bg-blue-100 text-blue-800 border-blue-200',
        [STATUSES.INSTALLED]: 'bg-green-100 text-green-800 border-green-200',
        [STATUSES.ERROR]: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};
