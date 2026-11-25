'use client';
import { Button } from '@workspace/ui/components/button';
import { useAppSelector, selectIsViewAs, useAccess } from '@/modules/app';
import { EAccessFeature } from '@/modules/shared/access';
import { useReportFlow } from '@/modules/feature/report-flow';
import { DownLoad } from '@/modules/feature';
import { ShareLinksControl } from '@/modules/feature/report-links';
import { ViewAsControl } from '@/modules/feature/view-as';
import { PlansSettingsControl } from '@/modules/feature/plans';
import { ReportSettingsLink, SupportChatLink } from '@/modules/feature/portal-view';
import { useIsUserReport } from '../../lib/use-is-user-report';
import SaveFilter from './SaveFilter';
import { RecalculateAction } from './RecalculateAction';

interface ReportHeaderActionsProps {
    isFilterOpen: boolean;
    setIsFilterOpen: (isFilterOpen: boolean) => void;
}

/**
 * Правая группа кнопок хедера: при открытых фильтрах —
 * «Сохранить»/«Применить» (панель правит черновик: «Применить» переносит его
 * в действующий фильтр и перезапрашивает отчёт, «Скрыть фильтры» черновик
 * выбрасывает), иначе «Поделиться»/«Пересчитать»/«Скачать»/«Настройки отчёта»
 * (кроме страницы сотрудника) и «Поддержка» (есть и на странице сотрудника,
 * если ссылка настроена); переключатель фильтров — всегда.
 *
 * Действия шапки — иконки в рамке с подсказкой (HeaderAction): слова занимают
 * место и не помещаются в узком окне портала. Со словами — только
 * переключатель фильтров и «Применить»: это главные действия панели фильтров.
 */
export const ReportHeaderActions = ({
    isFilterOpen,
    setIsFilterOpen,
}: ReportHeaderActionsProps) => {
    const { applyFilter } = useReportFlow();
    const isUserReport = useIsUserReport();
    // viewAs: сохранение фильтра и публичные ссылки скрыты — нельзя писать
    // от имени просматриваемого пользователя (гарды в thunks — вторая линия)
    const isViewAs = useAppSelector(selectIsViewAs);
    // Публичные ссылки — только руководителям/superuser (централизованное право)
    const canShareLinks = useAccess(EAccessFeature.SHARE_LINKS);

    return (
        <div className="flex flex-row items-center gap-2">
            {isFilterOpen ? (
                <>
                    {!isViewAs && <SaveFilter />}
                    <Button
                        variant="default"
                        className="h-8 cursor-pointer"
                        onClick={applyFilter}
                    >
                        Применить
                    </Button>
                </>
            ) : (
                <>
                    {!isUserReport && (
                        <>
                            <ViewAsControl />
                            {/* Настройка планов — руководители (гейт внутри) */}
                            {!isViewAs && <PlansSettingsControl />}
                            {!isViewAs && canShareLinks && <ShareLinksControl />}
                            {/* Пересчёт сохранённого расчёта — руководители (гейт внутри) */}
                            <RecalculateAction />
                            <DownLoad />
                            {/* Настройки отчёта — руководитель группы и выше (гейт внутри) */}
                            {!isViewAs && <ReportSettingsLink />}
                        </>
                    )}
                    {/* Чат поддержки — виден, когда ссылка настроена на портале */}
                    <SupportChatLink />
                </>
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
