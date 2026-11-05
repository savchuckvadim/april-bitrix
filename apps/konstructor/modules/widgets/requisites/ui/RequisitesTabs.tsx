'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { BxRqAddressEdit, BxRqBankEdit, BxRqBaseEdit } from '@/modules/entities/bx-rq';

export interface RequisitesTabsProps {
    /** Адреса и банк есть только у сохранённого реквизита. */
    detailsEnabled: boolean;
}

/** Основные поля, адреса и банк текущего реквизита. */
export const RequisitesTabs = ({ detailsEnabled }: RequisitesTabsProps) => (
    <Tabs defaultValue="base" className="space-y-4">
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
