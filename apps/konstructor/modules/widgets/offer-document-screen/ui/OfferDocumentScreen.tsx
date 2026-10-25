'use client';

import { ArrowLeft, PackageOpen } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { BuildSummary } from '@/modules/features/build-summary';
import { InvoiceOptions, OfferGenerateButton, RecipientFields } from '@/modules/features/offer-form';
import { ZakupkiCard } from '@/modules/features/zakupki-offer';
import {
    WordTemplateMenu,
    WordTemplatePdfPreviewPanelLoadable,
    WordTemplateSettingsDialog,
} from '@/modules/entities/offer-template-word';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useOfferDocumentScreen } from '../hooks/use-offer-document-screen';

/**
 * КП (Word): шаблон, получатель, поставщик и счёт, PDF-превью; справа —
 * сводка сборки и «Сформировать». Легаси DocumentPage + Options + Recipient.
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
        <Screen>
            <ScreenHeader
                title="Коммерческое предложение"
                description="Word-шаблон, получатель и счёт. Проверьте превью и сформируйте документ в сделку."
                actions={
                    <Button variant="ghost" onClick={screen.toHub}>
                        <ArrowLeft aria-hidden />
                        К документам
                    </Button>
                }
            />
            <ScreenSplit
                aside={
                    <SectionCard title="Сборка" tone="complect" accent footer={<OfferGenerateButton />}>
                        <BuildSummary />
                    </SectionCard>
                }
            >
                <WordTemplateMenu isWord />
                <div className="grid gap-4 xl:grid-cols-2">
                    <RecipientFields />
                    <InvoiceOptions />
                </div>
                {screen.zakupkiEnabled ? <ZakupkiCard /> : null}
                <SectionCard
                    title="Превью PDF"
                    description="Как КП будет выглядеть по выбранному шаблону."
                    tone="complect"
                >
                    <WordTemplatePdfPreviewPanelLoadable />
                </SectionCard>
            </ScreenSplit>
            <WordTemplateSettingsDialog />
        </Screen>
    );
};
