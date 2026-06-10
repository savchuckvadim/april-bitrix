'use client';

import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { SmartList } from '@/modules/entities/portal-bitrix/btx-smarts/ui/smarts-list';
import { SmartInstallPanel } from '@/modules/features/pbx/pbx-smart-install';
import { getUrlToSmart } from '@/modules/entities/portal-bitrix/btx-smarts';

export default function SmartsPage() {
    const params = useParams<{ portalId: string }>();
    const router = useRouter();
    const portalId = Number(params.portalId);

    return (
        <div className="space-y-4">
            <Tabs defaultValue="installed">
                <TabsList>
                    <TabsTrigger value="installed">Установленные</TabsTrigger>
                    <TabsTrigger value="template">Из шаблона (PBX)</TabsTrigger>
                </TabsList>

                <TabsContent value="installed" className="mt-4">
                    <SmartList portalId={portalId} />
                </TabsContent>

                <TabsContent value="template" className="mt-4">
                    <SmartInstallPanel
                        portalId={portalId}
                        onViewSmart={(smartId) =>
                            router.push(getUrlToSmart(portalId, smartId))
                        }
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
