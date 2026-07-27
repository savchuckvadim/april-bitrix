'use client';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector, selectIsViewAs, useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { useReportFlow } from '@/modules/feature/report-flow';
import { DownLoad } from '@/modules/feature';
import { ShareLinksControl } from '@/modules/feature/report-links';
import { ViewAsControl } from '@/modules/feature/view-as';
import { PlansSettingsControl } from '@/modules/feature/plans';
import { useIsUserReport } from '../../lib/use-is-user-report';
import SaveFilter from './SaveFilter';

interface ReportHeaderActionsProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}

/**
 * Правая группа кнопок хедера: при открытых фильтрах —
 * «Сохранить»/«Применить», иначе «Поделиться»/«Скачать»
 * (кроме страницы сотрудника); переключатель фильтров — всегда.
 */
export const ReportHeaderActions = ({
    isFilterOpen,
    setIsFilterOpen,
}: ReportHeaderActionsProps) => {
    const { refreshReport } = useReportFlow();
    const isUserReport = useIsUserReport();
    // viewAs: сохранение фильтра и публичные ссылки скрыты — нельзя писать
    // от имени просматриваемого пользователя (гарды в thunks — вторая линия)
    const isViewAs = useAppSelector(selectIsViewAs);
    // Публичные ссылки — только руководителям/superuser (централизованное право)
    const canShareLinks = useAccess(EAccessFeature.SHARE_LINKS);

    const applyFilters = () => {
        refreshReport();
        setIsFilterOpen(false);
    };

    return (
        <div className="flex flex-row items-center gap-2">
            {isFilterOpen ? (
                <>
                    {!isViewAs && <SaveFilter />}
                    <Button
                        variant="default"
                        className="h-8 cursor-pointer"
                        onClick={applyFilters}
                    >
                        Применить
                    </Button>
                </>
            ) : (
                !isUserReport && (
                    <>
                        <ViewAsControl />
                        {/* Настройка планов — руководители (гейт внутри) */}
                        {!isViewAs && <PlansSettingsControl />}
                        {!isViewAs && canShareLinks && <ShareLinksControl />}
                        <DownLoad />
                    </>
                )
            )}
            <Button
                variant="outline"
                className="h-8 cursor-pointer"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
                {isFilterOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
            </Button>
        </div>
    );
};
