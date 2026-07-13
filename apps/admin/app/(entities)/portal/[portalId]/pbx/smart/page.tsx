'use client';

import { useParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
    SmartProcessPanel,
    SmartFieldsPanel,
    SmartCategoriesPanel,
} from '@/modules/entities/pbx/smart';

export default function PbxSmartPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);

    return (
        <Tabs defaultValue="process" className="space-y-4">
            <TabsList>
                <TabsTrigger value="process">Смарт</TabsTrigger>
                <TabsTrigger value="fields">Поля</TabsTrigger>
                <TabsTrigger value="categories">Воронки и стадии</TabsTrigger>
            </TabsList>
            <TabsContent value="process">
                <SmartProcessPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="fields">
                <SmartFieldsPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="categories">
                <SmartCategoriesPanel portalId={portalId} />
            </TabsContent>
        </Tabs>
    );
}
