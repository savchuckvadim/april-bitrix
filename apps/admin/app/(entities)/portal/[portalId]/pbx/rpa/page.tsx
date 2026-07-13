'use client';

import { useParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
    RpaProcessPanel,
    RpaFieldsPanel,
    RpaCategoriesPanel,
} from '@/modules/entities/pbx/rpa';

export default function PbxRpaPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    return (
        <Tabs defaultValue="process" className="space-y-4">
            <TabsList>
                <TabsTrigger value="process">RPA</TabsTrigger>
                <TabsTrigger value="fields">Поля</TabsTrigger>
                <TabsTrigger value="categories">Воронка и стадии</TabsTrigger>
            </TabsList>
            <TabsContent value="process">
                <RpaProcessPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="fields">
                <RpaFieldsPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="categories">
                <RpaCategoriesPanel portalId={portalId} />
            </TabsContent>
        </Tabs>
    );
}
