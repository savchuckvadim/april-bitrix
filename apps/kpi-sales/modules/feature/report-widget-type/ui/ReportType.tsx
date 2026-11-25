'use client';

import { useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
// Прямой путь, не index фичи: нужен один хук настроек (без UI-кнопок шапки).
import { useHiddenTabs } from '@/modules/feature/portal-view/hooks/use-portal-view';
import { useReportType } from '../hooks/report-type.hook';
import { useEnsureAvailableReportType } from '../hooks/use-available-report-types';
import { reportNavItems, type ReportNavPage } from '../lib/report-nav';
import { ReportNavTab } from './ReportNavTab';

interface ReportTypeProps {
    /**
     * Где показан ряд: в отчёте (по умолчанию), на странице «Разборов звонков»
     * или на странице настроек отчёта.
     */
    page?: ReportNavPage;
}

/**
 * Ряд вкладок верхнего уровня: типы отчёта и «Разборы звонков» сразу после
 * «AI аналитики». Список — только доступные текущему пользователю
 * (централизованные права: shared/access + useAccess) и не скрытые порталом
 * (настройки отчёта); недоступная сохранённая вкладка автоматически уводится
 * на «Все». «Разборы звонков» — отдельная страница `/calls`: из отчёта на неё
 * ведёт ссылка, на ней самой она активна, а типы отчёта становятся ссылками
 * обратно в отчёт. На странице настроек активной вкладки нет — все ссылки.
 */
export const ReportType = ({ page = 'report' }: ReportTypeProps) => {
    const { current, setCurrentReportType } = useReportType();
    const available = useEnsureAvailableReportType();
    const canCallReviews = useAccess(EAccessFeature.AI_CALL_REVIEWS);
    const hiddenTabs = useHiddenTabs();
    const items = reportNavItems(available, canCallReviews, hiddenTabs);
    return (
        <div className="flex flex-wrap items-center gap-2 p-0 m-0">
            {items.map(item => (
                <ReportNavTab
                    key={item.kind === 'type' ? item.type : item.kind}
                    item={item}
                    page={page}
                    current={current}
                    onSelectType={setCurrentReportType}
                />
            ))}
        </div>
    );
};
