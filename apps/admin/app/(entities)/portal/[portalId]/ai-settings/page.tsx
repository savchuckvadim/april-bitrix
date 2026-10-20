'use client';

import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { PortalAiSettingsPanel } from '@/modules/entities/portal/ai-settings';
import { PortalKnowledgePanel } from '@/modules/entities/ai-knowledge';
import { AiLaunchPanel } from '@/modules/entities/ai-analytics-launch';
import { usePortal } from '@/modules/entities/portal/hooks';

/** Вкладки страницы; `?tab=knowledge` открывает базу знаний (ссылки путеводителя). */
const AI_SETTINGS_TAB = { settings: 'settings', knowledge: 'knowledge' } as const;

/**
 * Управление AI портала в одном месте: сверху — панель «Запуск AI после
 * выкладки» (большие кнопки по шагам, домен — из карточки), ниже —
 * настройки конвейера (вкладка «Настройки») и RAG-хранилище портала
 * (вкладка «База знаний»).
 * Адрес `?tab=knowledge&kind=<kind>` открывает базу знаний на нужном
 * kind — так ссылаются путеводитель и категории настроек.
 */
function PortalAiSettingsContent() {
    const params = useParams<{ portalId: string }>();
    const searchParams = useSearchParams();
    const portalId = Number(params.portalId);
    const portal = usePortal(
        Number.isInteger(portalId) && portalId > 0 ? portalId : 0,
    );
    const initialTab =
        searchParams.get('tab') === AI_SETTINGS_TAB.knowledge
            ? AI_SETTINGS_TAB.knowledge
            : AI_SETTINGS_TAB.settings;
    const initialKind = searchParams.get('kind') ?? undefined;

    if (!Number.isInteger(portalId) || portalId <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Некорректный id портала в адресе страницы.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {portal.data?.domain && <AiLaunchPanel domain={portal.data.domain} />}
            <Tabs defaultValue={initialTab}>
                <TabsList>
                    <TabsTrigger value={AI_SETTINGS_TAB.settings}>Настройки AI</TabsTrigger>
                    <TabsTrigger value={AI_SETTINGS_TAB.knowledge}>База знаний</TabsTrigger>
                </TabsList>
                <TabsContent value={AI_SETTINGS_TAB.settings}>
                    <PortalAiSettingsPanel portalId={portalId} />
                </TabsContent>
                <TabsContent value={AI_SETTINGS_TAB.knowledge}>
                    {portal.data?.domain ? (
                        <PortalKnowledgePanel
                            domain={portal.data.domain}
                            initialKind={initialKind}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

/** Suspense — граница для `useSearchParams` (вкладка и kind из адреса). */
export default function PortalAiSettingsPage() {
    return (
        <Suspense fallback={null}>
            <PortalAiSettingsContent />
        </Suspense>
    );
}
