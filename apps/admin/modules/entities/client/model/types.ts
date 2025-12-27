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

export interface Webhook {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'error';
    lastCalled: string;
}

export interface Organization {
    id: string;
    name: string;
    inn: string;
    address: string;
    isMain: boolean;
}
