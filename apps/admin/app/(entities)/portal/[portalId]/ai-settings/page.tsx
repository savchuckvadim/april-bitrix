'use client';

import { useParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { PortalAiSettingsPanel } from '@/modules/entities/portal/ai-settings';
import { PortalKnowledgePanel } from '@/modules/entities/ai-knowledge';
import { usePortal } from '@/modules/entities/portal/hooks';

/**
 * Управление AI портала в одном месте: настройки конвейера (вкладка
 * «Настройки») и RAG-хранилище портала (вкладка «База знаний»).
 */
export default function PortalAiSettingsPage() {
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    const portal = usePortal(
        Number.isInteger(portalId) && portalId > 0 ? portalId : 0,
    );

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return (
        <Tabs defaultValue="settings">
            <TabsList>
                <TabsTrigger value="settings">Настройки AI</TabsTrigger>
                <TabsTrigger value="knowledge">База знаний</TabsTrigger>
            </TabsList>
            <TabsContent value="settings">
                <PortalAiSettingsPanel portalId={portalId} />
            </TabsContent>
            <TabsContent value="knowledge">
                {portal.data?.domain ? (
                    <PortalKnowledgePanel domain={portal.data.domain} />
                ) : (
                    <p className="text-sm text-muted-foreground">Загрузка…</p>
                )}
            </TabsContent>
        </Tabs>
    );
}
