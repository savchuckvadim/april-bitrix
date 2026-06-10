import * as React from 'react';

export type TabId = 'main' | 'fields' | 'categories' | 'pbx-install';

export type Scalar = string | number | boolean | null | undefined;

export type GenericEntity = Record<string, unknown>;

export interface EntityRelationsTab {
    id: TabId;
    label: string;
    content: React.ReactNode;
    badgeCount?: number;
    disabled?: boolean;
}
