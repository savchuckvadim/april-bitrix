'use client';

import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import type { DocumentKind } from '@/modules/shared/lib/routing';
import { Screen, ScreenHeader } from '@/modules/shared';
import { ContractDocumentScreen } from '@/modules/widgets/contract-document-screen';
import { OfferDocumentScreen } from '@/modules/widgets/offer-document-screen';
import { SupplyReportScreen } from '@/modules/widgets/supply-report-screen';
import { useDocumentScreen } from '../hooks/use-document-screen';

export interface DocumentScreenProps {
    kind: DocumentKind;
}

/**
 * Шаг 5: экран документа. КП и договор перенесены (OfferDocumentScreen,
 * ContractDocumentScreen); отчёт о поставке ещё переносится — маршрут и место в навигации уже
 * окончательные, а содержимое честно говорит, что здесь будет.
 */
export const DocumentScreen = ({ kind }: DocumentScreenProps) => {
    if (kind === 'offer') return <OfferDocumentScreen />;
    if (kind === 'contract') return <ContractDocumentScreen />;
    if (kind === 'supply-report') return <SupplyReportScreen />;
    return <DocumentPlaceholderScreen kind={kind} />;
};

const DocumentPlaceholderScreen = ({ kind }: DocumentScreenProps) => {
    const screen = useDocumentScreen(kind);

    return (
        <Screen>
            <ScreenHeader
                title={screen.info.title}
                description={screen.info.description}
                actions={
                    <Button variant="ghost" onClick={screen.toHub}>
                        <ArrowLeft aria-hidden />
                        К документам
                    </Button>
                }
            />
            <EmptyState
                icon={screen.info.icon}
                tone="complect"
                title="Экран переносится"
                description="Документ собирается из текущей сборки сделки."
                actions={
                    screen.withTemplates ? (
                        <Button variant="outline" onClick={screen.toSettings}>
                            Шаблоны документов
                        </Button>
                    ) : null
                }
            />
            <SectionCard title="Что будет на экране" density="compact">
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {screen.info.legacyScope.map(item => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </SectionCard>
        </Screen>
    );
};
