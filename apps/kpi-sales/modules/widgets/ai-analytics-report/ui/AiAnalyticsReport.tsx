'use client';

import { useAiAnalyticsReport } from '../hooks/use-ai-analytics-report';
import { AiTabHeader } from './AiTabHeader';
import { AiReadinessBanner } from './AiReadinessBanner';
import { AiTabsBar } from './AiTabsBar';
import { AiTypesDrawer } from './AiTypesDrawer';
import { AiSummaryTab } from './tabs/AiSummaryTab';
import { AiEmployeesTab } from './tabs/AiEmployeesTab';
import { AiQualityTab } from './tabs/AiQualityTab';
import { AiShowcaseSettingsTab } from './tabs/AiShowcaseSettingsTab';

/**
 * Вкладка «AI аналитика»: шапка и «Готовность витрины» с чек-листом над
 * подвкладками; подвкладки — «Сводка» (пульс, итоги периода, «Внимание»,
 * повестка, план дня, план-факт, прогноз), «Сотрудники» (таблица сигналов
 * и раскрытые настройки по людям), «Качество звонков» (три звонка недели,
 * матрицы типов и разделов), «Настройки витрины» (гипотеза качества, пул
 * порталов, «Как считаем»). Подвкладка — в URL (`?aiTab=`), ссылки «Задать
 * цель» и пункты чек-листа ведут на подвкладку и секцию (`?aiSection=`).
 * Разбор по типам (drawer) смонтирован на уровне вкладки: открывается из
 * «Сводки» и «Качества». В kpi-only разборов нет — секции с оценками
 * заменяет пояснение, настройки остаются доступны.
 */
export const AiAnalyticsReport = () => {
    const report = useAiAnalyticsReport();
    const onOpenSettings = report.canConfigure
        ? report.openSettings
        : undefined;

    return (
        <div className="space-y-4">
            <AiTabHeader
                canViewAll={report.canViewAll}
                canConfigure={report.canConfigure}
                clampedPeriod={report.clampedPeriod}
                scope={report.scopeNote}
                isRefreshing={report.isRefreshing}
                isRecalculating={report.isRecalculating}
                onRefresh={report.refresh}
                onRecalc={report.recalc}
                onOpenSettings={report.openLevels}
            />
            {report.settings && report.checklist && (
                <AiReadinessBanner
                    settings={report.settings}
                    checklist={report.checklist}
                    onOpenSettings={onOpenSettings}
                />
            )}
            <AiTabsBar tab={report.tab} onChange={report.setTab} />
            {report.tab === 'summary' && (
                <AiSummaryTab
                    canViewAll={report.canViewAll}
                    kpiOnly={report.kpiOnly}
                    onOpenTargets={
                        report.canConfigure ? report.openTargets : undefined
                    }
                />
            )}
            {report.tab === 'employees' && (
                <AiEmployeesTab
                    canConfigure={report.canConfigure}
                    kpiOnly={report.kpiOnly}
                    focusSection={report.section}
                />
            )}
            {report.tab === 'quality' && (
                <AiQualityTab kpiOnly={report.kpiOnly} />
            )}
            {report.tab === 'settings' && (
                <AiShowcaseSettingsTab
                    canConfigure={report.canConfigure}
                    focusSection={report.section}
                />
            )}
            {!report.kpiOnly && <AiTypesDrawer />}
        </div>
    );
};
