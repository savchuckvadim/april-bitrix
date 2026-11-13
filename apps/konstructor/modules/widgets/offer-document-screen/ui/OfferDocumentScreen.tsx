'use client';

import { PackageOpen } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { OfferPdfDocumentProvider } from '@/modules/entities/offer-pdf';
import { Screen } from '@/modules/shared';
import { useOfferDocumentScreen } from '../hooks/use-offer-document-screen';
import { OfferDocumentScreenBody } from './OfferDocumentScreenBody';

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
