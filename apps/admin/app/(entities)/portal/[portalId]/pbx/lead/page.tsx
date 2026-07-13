'use client';

import { useParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { LeadFieldsPanel, LeadStagesPanel } from '@/modules/entities/pbx/lead';

export default function PbxLeadPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    return (
        <Tabs defaultValue="fields" className="space-y-4">
            <TabsList>
                <TabsTrigger value="fields">Поля</TabsTrigger>
                <TabsTrigger value="stages">Стадии</TabsTrigger>
            </TabsList>
            <TabsContent value="fields">
                <LeadFieldsPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="stages">
                <LeadStagesPanel portalId={portalId} />
            </TabsContent>
        </Tabs>
    );
}
