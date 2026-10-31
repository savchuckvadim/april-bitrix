'use client';

import { ComplectVariantPanel } from '@/modules/features/complect-variant-select';
import { DealSendButton } from '@/modules/features/deal-send';
import { SaveToLibraryButton } from '@/modules/features/save-to-library';
import { ServicePeriodSwitch } from '@/modules/features/service-period';
import { PriceTableWidget } from '@/modules/widgets/price-table';
import { useDealPriceTable } from '../hooks/use-deal-price-table';
import { ProviderField } from './ProviderField';
import { SaveSnapshotButton } from './SaveSnapshotButton';
import { SnapshotWarnings } from './SnapshotWarnings';

/**
 * Шаг «Цены» во фрейме сделки: общая таблица плюс всё, что связано со сделкой —
 * вспоминание слепка, варианты КП, поставщик, сохранение и отправка.
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
                        <SaveSnapshotButton />
                        <DealSendButton navigateAfter />
                    </>
                ),
            }}
        />
    );
};
