'use client';

import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import { DigestSection, DigestTile } from '../../digest-section';
import { useDigestSales } from '../hooks/use-digest-sales';
import { SalesTable } from './SalesTable';

/**
 * «Продажи»: выигранные в этот день сделки «ОП Основная» и связанные с
 * ними (to_base_sales) сделки «ОП Презентации».
 */
export const DigestSales = () => {
    const sales = useDigestSales();

    return (
        <DigestSection
            widget="sales"
            title={`Продажи (${sales.sales.length})`}
            description="Сделки «ОП Основная», закрытые в успех в этот день, с клиентом, комплектом, суммой и презентациями этой продажи. Наведите на сделку — последние строки её истории."
        >
            {!sales.available ? (
                <p className="py-3 text-sm text-muted-foreground">
                    Сделки недоступны — причина в предупреждениях вверху
                </p>
            ) : !sales.sales.length ? (
                <p className="py-3 text-sm text-muted-foreground">Продаж за день нет</p>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {sales.tiles.map(tile => (
                            <DigestTile key={tile.key} tile={tile} />
                        ))}
                    </div>
                    <ReportGroupTabs
                        presentUserIds={sales.presentUserIds}
                        renderSummary={() => (
                            <SalesTable sales={sales.sales} nameOf={sales.nameOf} domain={sales.domain} />
                        )}
                        renderSection={userIds => (
                            <SalesTable
                                sales={sales.sales.filter(sale => userIds.has(sale.assignedId))}
                                nameOf={sales.nameOf}
                                domain={sales.domain}
                            />
                        )}
                    />
                </div>
            )}
        </DigestSection>
    );
};
