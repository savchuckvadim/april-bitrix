'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { BxRqAddressEdit, BxRqBankEdit, BxRqBaseEdit } from '@/modules/entities/bx-rq';
import type { RequisitesTab } from '../lib/requisites-tab.util';

export interface RequisitesTabsProps {
    /** Адреса и банк есть только у сохранённого реквизита. */
    detailsEnabled: boolean;
    tab: RequisitesTab;
    onTabChange: (tab: string) => void;
}

/**
 * Основные поля, адреса и банк текущего реквизита. Окна правки сюда не
 * входят: вкладка снимается с экрана целиком, и окно, открытое из другого
 * места, исчезло бы вместе с ней (их рисует BxRqDraftModals у экрана).
 */
export const RequisitesTabs = ({ detailsEnabled, tab, onTabChange }: RequisitesTabsProps) => (
    <Tabs value={tab} onValueChange={onTabChange} className="space-y-4">
        <TabsList>
            <TabsTrigger value="base">Основные</TabsTrigger>
            <TabsTrigger value="addresses" disabled={!detailsEnabled}>
                Адреса
            </TabsTrigger>
            <TabsTrigger value="bank" disabled={!detailsEnabled}>
                Банковские
            </TabsTrigger>
        </TabsList>
        {!detailsEnabled ? (
            <p className="text-xs text-muted-foreground">
                Адреса и банк появятся после сохранения основной информации.
            </p>
        ) : null}
        <TabsContent value="base" className="space-y-4">
            <BxRqBaseEdit />
        </TabsContent>
        <TabsContent value="addresses" className="space-y-4">
            <BxRqAddressEdit />
        </TabsContent>
        <TabsContent value="bank" className="space-y-4">
            <BxRqBankEdit />
        </TabsContent>
    </Tabs>
);
