'use client';

import { useParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { DealFieldsPanel, DealCategoriesPanel } from '@/modules/entities/pbx/deal';

export default function PbxDealPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    return (
        <Tabs defaultValue="fields" className="space-y-4">
            <TabsList>
                <TabsTrigger value="fields">Поля</TabsTrigger>
                <TabsTrigger value="categories">Воронки и стадии</TabsTrigger>
            </TabsList>
            <TabsContent value="fields">
                <DealFieldsPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="categories">
                <DealCategoriesPanel portalId={portalId} />
            </TabsContent>
        </Tabs>
    );
}
