'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { PbxProcessManager } from '../../../../process';
import { DbSmartsPanel } from '../../../db';
import { SmartGalleryPanel } from '../../../gallery';
import { smartProcessAdapter } from '../../lib/api/smart-process-adapter';

/**
 * Вкладка «Смарт»: сверху — переключатель «Галерея» (единая галерея смартов:
 * PortalDB + const-реестр + Excel-эталоны) / «Таблица БД» (смарты портала из
 * PortalDB с деталями и установкой AI-смарта); ниже, в свёрнутом блоке —
 * установка по эталону (pbx-install) для шаблонных смартов.
 */
export function SmartProcessPanel({ portalId }: { portalId: number }) {
    return (
        <div className="space-y-4">
            <Tabs defaultValue="gallery" className="space-y-2">
                <TabsList>
                    <TabsTrigger value="gallery">Галерея</TabsTrigger>
                    <TabsTrigger value="table">Таблица БД</TabsTrigger>
                </TabsList>
                <TabsContent value="gallery">
                    <SmartGalleryPanel portalId={portalId} />
                </TabsContent>
                <TabsContent value="table">
                    <DbSmartsPanel portalId={portalId} />
                </TabsContent>
            </Tabs>
            <Accordion type="single" collapsible>
                <AccordionItem value="template-install">
                    <AccordionTrigger className="text-sm">
                        Установка по эталону (шаблонные смарты)
                    </AccordionTrigger>
                    <AccordionContent>
                        <PbxProcessManager
                            portalId={portalId}
                            adapter={smartProcessAdapter}
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
