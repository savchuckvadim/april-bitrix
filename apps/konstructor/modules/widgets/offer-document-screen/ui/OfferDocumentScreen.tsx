'use client';

import { ArrowLeft, PackageOpen } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { BuildSummary } from '@/modules/features/build-summary';
import { InvoiceOptions, OfferGenerateButton, RecipientFields } from '@/modules/features/offer-form';
import { ZakupkiCard } from '@/modules/features/zakupki-offer';
import {
    OFFER_DOCUMENT_FORMAT,
    OfferDocumentFormatSwitch,
    OfferPdfDocumentProvider,
    OfferPdfGenerateButton,
    OfferPdfPreviewPanelLoadable,
    OfferPdfTemplateCard,
    useOfferPdfDocument,
} from '@/modules/entities/offer-pdf';
import {
    WordTemplateMenu,
    WordTemplatePdfPreviewPanelLoadable,
    WordTemplateSettingsDialog,
} from '@/modules/entities/offer-template-word';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useOfferDocumentScreen } from '../hooks/use-offer-document-screen';

/**
 * КП: по Word-шаблону (очередь, счёт, сделка) или PDF из встроенного
 * шаблона (собирается сразу, превью обновляется само). Справа — сводка
 * сборки и «Сформировать». Легаси DocumentPage + Options + Recipient.
 */
export const OfferDocumentScreen = () => {
    const screen = useOfferDocumentScreen();

    if (!screen.hasMainRow) {
        return (
            <Screen width="narrow">
                <EmptyState
                    icon={PackageOpen}
                    title="Сборки ещё нет"
                    description="КП делается по собранному комплекту и ценам."
                    actions={<Button onClick={screen.toCreate}>Начать сборку</Button>}
                />
            </Screen>
        );
    }

    return (
        <OfferPdfDocumentProvider>
            <OfferDocumentScreenBody zakupkiEnabled={screen.zakupkiEnabled} toHub={screen.toHub} />
        </OfferPdfDocumentProvider>
    );
};

const OfferDocumentScreenBody = ({ zakupkiEnabled, toHub }: { zakupkiEnabled: boolean; toHub: () => void }) => {
    const { format } = useOfferPdfDocument();
    const isPdf = format === OFFER_DOCUMENT_FORMAT.PDF;

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
                        footer={isPdf ? <OfferPdfGenerateButton /> : <OfferGenerateButton />}
                    >
                        <BuildSummary />
                    </SectionCard>
                }
            >
                <OfferDocumentFormatSwitch />
                {isPdf ? <OfferPdfTemplateCard /> : <WordTemplateMenu isWord />}
                <div className="grid gap-4 xl:grid-cols-2">
                    <RecipientFields />
                    {isPdf ? null : <InvoiceOptions />}
                </div>
                {zakupkiEnabled && !isPdf ? <ZakupkiCard /> : null}
                <SectionCard
                    title="Превью PDF"
                    description={
                        isPdf ? 'Так будет выглядеть документ. Меняйте настройки — превью пересоберётся.' : 'Как КП будет выглядеть по выбранному шаблону.'
                    }
                    tone="complect"
                >
                    {isPdf ? <OfferPdfPreviewPanelLoadable /> : <WordTemplatePdfPreviewPanelLoadable />}
                </SectionCard>
            </ScreenSplit>
            <WordTemplateSettingsDialog />
        </Screen>
    );
};
