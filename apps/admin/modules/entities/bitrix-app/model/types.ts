export interface BitrixApp {
    id: number;
    portal_id: number;
    code: string;
    group: 'sales' | 'service' | 'marketing' | 'support' | 'analytics';
    type: 'widget' | 'webhook' | 'integration';
    status: 'not_installed' | 'installing' | 'installed' | 'error';
    created_at?: string;
    updated_at?: string;
}

