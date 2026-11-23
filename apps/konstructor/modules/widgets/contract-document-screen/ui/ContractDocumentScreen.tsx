'use client';

import { ArrowLeft, PackageOpen } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { ComplectModeSelect } from '@/modules/features/complect-mode-select';
import {
    ContractDealFieldsCard,
    ContractRequisitesCard,
    ContractSpecificationCard,
    ContractUnitsSection,
} from '@/modules/features/contract-form';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useContractDocumentScreen } from '../hooks/use-contract-document-screen';
import { ContractSingleAside } from './ContractSingleAside';
import { ContractUnitsAside } from './ContractUnitsAside';

/**
 * Договор: поля сделки, реквизиты клиента, спецификация; справа — сводка
 * сборки, поставщик и «Сформировать». Легаси DocumentContract + Options.
 * Когда варианты комплекта продаются вместе, номер, спецификация и кнопка
 * переезжают в карточки договоров по вариантам, общие блоки остаются одни.
 * Над договорами стоит выбор, какие варианты в них идут (при двух и более
 * незакрытых вариантах): та же настройка сделки, что на экране отчёта о поставке.
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
                aside={screen.hasUnits ? <ContractUnitsAside unitsCount={screen.unitsCount} /> : <ContractSingleAside />}
            >
                <div className="grid gap-4 xl:grid-cols-2">
                    <ContractDealFieldsCard withContractNumber={!screen.hasUnits} />
                    <ContractRequisitesCard />
                </div>
                <ComplectModeSelect />
                {screen.hasUnits ? <ContractUnitsSection /> : <ContractSpecificationCard />}
            </ScreenSplit>
        </Screen>
    );
};
