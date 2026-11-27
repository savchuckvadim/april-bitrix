'use client';

import { ComplectVariantPanel } from '@/modules/features/complect-variant-select';
import { DealSendButton } from '@/modules/features/deal-send';
import { SaveToLibraryButton } from '@/modules/features/save-to-library';
import { ServicePeriodSwitch } from '@/modules/features/service-period';
import { PriceTableWidget } from '@/modules/widgets/price-table';
import { useDealPriceTable } from '../hooks/use-deal-price-table';
import { ProviderField } from './ProviderField';
import { SnapshotWarnings } from './SnapshotWarnings';

/**
 * Шаг «Цены» во фрейме сделки: общая таблица плюс всё, что связано со сделкой —
 * вспоминание слепка, варианты КП, поставщик и «Сохранить сделку» (поля,
 * товары и слепок предложения — одним действием). Та же кнопка стоит в «Итоге»
 * под суммой: со сделкой рядом с «Далее: Документ», без сделки вместо него
 * («Создать сделку»).
 */
export const DealPriceTable = () => {
    const table = useDealPriceTable();

    return (
        <PriceTableWidget
            isPreparing={table.isRestoring}
            notice={<SnapshotWarnings warnings={table.snapshotWarnings} />}
            beforeSets={<ComplectVariantPanel />}
            header={{
                lead: <ServicePeriodSwitch />,
                fields: <ProviderField />,
                actions: (
                    <>
                        <SaveToLibraryButton />
                        <DealSendButton navigateAfter />
                    </>
                ),
            }}
            summary={{
                showNext: table.summary.showNext,
                actions: table.summary.showDealSend ? (
                    <DealSendButton
                        navigateAfter
                        size="default"
                        variant={table.summary.dealSendVariant}
                        className="w-full"
                    />
                ) : null,
            }}
        />
    );
};
