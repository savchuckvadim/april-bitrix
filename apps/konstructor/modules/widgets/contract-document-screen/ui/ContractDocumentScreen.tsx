'use client';

import { ArrowLeft, PackageOpen } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { BuildSummary } from '@/modules/features/build-summary';
import {
    ContractDealFieldsCard,
    ContractGenerateButton,
    ContractRequisitesCard,
    ContractSpecificationCard,
} from '@/modules/features/contract-form';
import { ProviderChoice } from '@/modules/features/provider-select';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useContractDocumentScreen } from '../hooks/use-contract-document-screen';

/**
 * Договор: поля сделки, реквизиты клиента, спецификация; справа — сводка
 * сборки, поставщик и «Сформировать». Легаси DocumentContract + Options.
 */
export const ContractDocumentScreen = () => {
    const screen = useContractDocumentScreen();

    if (!screen.hasMainRow) {
        return (
            <Screen width="narrow">
                <EmptyState
                    icon={PackageOpen}
                    title="Сборки ещё нет"
                    description="Договор делается по собранному комплекту и ценам."
                    actions={<Button onClick={screen.toCreate}>Начать сборку</Button>}
                />
            </Screen>
        );
    }

    return (
        <Screen>
            <ScreenHeader
                title="Договор"
                description="Поля сделки, реквизиты клиента и спецификация. Документ уходит в таймлайн сделки."
                actions={
                    <Button variant="ghost" onClick={screen.toHub}>
                        <ArrowLeft aria-hidden />
                        К документам
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
                            <div className="flex w-full flex-col gap-3">
                                <ProviderChoice />
                                <ContractGenerateButton />
                            </div>
                        }
                    >
                        <BuildSummary />
                    </SectionCard>
                }
            >
                <div className="grid gap-4 xl:grid-cols-2">
                    <ContractDealFieldsCard />
                    <ContractRequisitesCard />
                </div>
                <ContractSpecificationCard />
            </ScreenSplit>
        </Screen>
    );
};
