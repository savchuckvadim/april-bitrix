'use client';

import { ArrowLeft } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { BuildSummary } from '@/modules/features/build-summary';
import {
    InvoiceOptions,
    OfferGenerateButton,
    RecipientFields,
} from '@/modules/features/offer-form';
import { ZakupkiCard } from '@/modules/features/zakupki-offer';
import {
    OFFER_DOCUMENT_FORMAT,
    OfferDocumentFormatSwitch,
    OfferPdfGenerateButton,
    OfferPdfPreviewPanelLoadable,
    OfferPdfTemplateCard,
    useOfferPdfDocument,
} from '@/modules/entities/offer-pdf';
import {
    WordTemplateMenu,
    WordTemplatePdfPreviewPanelLoadable,
} from '@/modules/entities/offer-template-word';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useOfferDocumentTabs } from '../hooks/use-offer-document-tabs';

export interface OfferDocumentScreenBodyProps {
    zakupkiEnabled: boolean;
    toHub: () => void;
}

/**
 * Экран КП: сверху — как собрать КП (Word-шаблон или встроенный PDF), под ним
 * вкладки «Настройка» (шаблон, получатель, счёт) и «Превью» — превью
 * собирается при открытии вкладки. Справа — сводка сборки и «Сформировать».
 */
export const OfferDocumentScreenBody = ({
    zakupkiEnabled,
    toHub,
}: OfferDocumentScreenBodyProps) => {
    const { format } = useOfferPdfDocument();
    const isPdf = format === OFFER_DOCUMENT_FORMAT.PDF;
    const tabs = useOfferDocumentTabs(isPdf);

    return (
        <Screen>
            <ScreenHeader
                title="Коммерческое предложение"
                description={
                    isPdf
                        ? 'Встроенный PDF-шаблон, получатель и письмо. Превью обновляется само — проверьте и сформируйте файл.'
                        : 'Word-шаблон, получатель и счёт. Проверьте превью и сформируйте документ в сделку.'
                }
                actions={
                    <Button variant="ghost" onClick={toHub}>
                        <ArrowLeft aria-hidden />К документам
                    </Button>
                }
            />
            <ScreenSplit
                aside={
                    <SectionCard
                        title="Сборка"
                        tone="complect"
                        accent
                        footer={
                            isPdf ? (
                                <OfferPdfGenerateButton />
                            ) : (
                                <OfferGenerateButton />
                            )
                        }
                    >
                        <BuildSummary />
                    </SectionCard>
                }
            >
                <div className="flex flex-col gap-4">
                    {/* способ сборки решает, что вообще настраивать и что превьюить, — над вкладками */}
                    <OfferDocumentFormatSwitch />
                    <Tabs
                        value={tabs.tab}
                        onValueChange={tabs.select}
                        className="gap-4"
                    >
                        <TabsList>
                            <TabsTrigger value="setup">Настройка</TabsTrigger>
                            <TabsTrigger value="preview">
                                Превью
                                {tabs.previewStale ? (
                                    <span
                                        aria-label="превью устарело"
                                        className="ml-1 size-1.5 rounded-full bg-warning"
                                    />
                                ) : null}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="setup"
                            className="flex flex-col gap-4"
                        >
                            {isPdf ? (
                                <OfferPdfTemplateCard />
                            ) : (
                                <WordTemplateMenu isWord />
                            )}
                            <div className="grid gap-4 xl:grid-cols-2">
                                <RecipientFields />
                                {isPdf ? null : <InvoiceOptions />}
                            </div>
                            {zakupkiEnabled && !isPdf ? <ZakupkiCard /> : null}
                        </TabsContent>
                        <TabsContent value="preview">
                            <SectionCard
                                title="Превью PDF"
                                description={
                                    isPdf
                                        ? 'Так будет выглядеть документ. Меняйте настройки — превью пересоберётся.'
                                        : 'Как КП будет выглядеть по выбранному шаблону. После правок на «Настройке» соберётся заново.'
                                }
                                tone="complect"
                            >
                                {isPdf ? (
                                    <OfferPdfPreviewPanelLoadable />
                                ) : (
                                    <WordTemplatePdfPreviewPanelLoadable />
                                )}
                            </SectionCard>
                        </TabsContent>
                    </Tabs>
                </div>
            </ScreenSplit>
        </Screen>
    );
};
