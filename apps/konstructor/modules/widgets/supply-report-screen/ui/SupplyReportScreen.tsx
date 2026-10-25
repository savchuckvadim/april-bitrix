'use client';

import { ArrowLeft, PackageOpen } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { SUPPLY_REPORT_DEAL_FIELDS } from '@/modules/entities/contract-document';
import { BuildSummary } from '@/modules/features/build-summary';
import {
    ContractDealFieldsCard,
    ContractRequisitesCard,
    ContractSpecificationCard,
} from '@/modules/features/contract-form';
import { ProviderChoice } from '@/modules/features/provider-select';
import {
    SupplyContactsCard,
    SupplyReportFieldsCard,
    SupplyReportGenerateButton,
} from '@/modules/features/supply-report-form';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useSupplyReportScreen } from '../hooks/use-supply-report-screen';

/**
 * Отчёт о поставке: поля сделки и поставки, реквизиты, форма для отдела
 * сервиса, контакты, спецификация; справа — сборка, поставщик, «Сформировать»
 * (+ процесс поставки RPA). Легаси DocumentSupplyReport.
 */
export const SupplyReportScreen = () => {
    const screen = useSupplyReportScreen();

    if (!screen.hasMainRow) {
        return (
            <Screen width="narrow">
                <EmptyState
                    icon={PackageOpen}
                    title="Сборки ещё нет"
                    description="Отчёт о поставке делается по собранному комплекту и ценам."
                    actions={<Button onClick={screen.toCreate}>Начать сборку</Button>}
                />
            </Screen>
        );
    }

    return (
        <Screen>
            <ScreenHeader
                title="Отчёт о поставке"
                description="Передача клиента в отдел сервиса: даты, ответственные, договор и счёт, заявка RPA."
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
                                <SupplyReportGenerateButton />
                            </div>
                        }
                    >
                        <BuildSummary />
                    </SectionCard>
                }
            >
                <div className="grid gap-4 xl:grid-cols-2">
                    <ContractDealFieldsCard
                        fields={SUPPLY_REPORT_DEAL_FIELDS}
                        withContractNumber={false}
                        title="Сделка и поставка"
                    />
                    <div className="flex flex-col gap-4">
                        <ContractRequisitesCard />
                        <SupplyContactsCard />
                    </div>
                </div>
                <SupplyReportFieldsCard />
                <ContractSpecificationCard />
            </ScreenSplit>
        </Screen>
    );
};
