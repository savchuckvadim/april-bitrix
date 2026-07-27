import type { ShareLinkPublicResponseDto } from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch } from '@/modules/app/model/store';
import {
    Filter,
    ReportData,
    ReportDateType,
    reportActions,
} from '@/modules/entities/report';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics';
import type { ReportCallingData } from '@/modules/entities/calling-statistics';
import { departmentActions } from '@/modules/entities/department';
import { reportTypeActions } from '@/modules/feature/report-widget-type/model/ReportTypeSlice';
import { mergedReportActions } from '@/modules/feature/merged-kpi-calling-report';
import { conversionsActions } from '@/modules/feature/report-conversions/model/conversions-slice';
import { financeActions } from '@/modules/entities/finance';
import type {
    FinanceClosedReport,
    FinanceHotReport,
    FinanceHotThreshold,
} from '@/modules/entities/finance/model';
import { airtimeActions } from '@/modules/entities/airtime/model/airtime-slice';
import type { AirtimeReport } from '@/modules/entities/airtime/model';
import type { ShareUiBlob } from '@/modules/feature/report-links';
import { appActions } from '@/modules/app/model/AppSlice';

export interface HydrateShareOptions {
    /**
     * Тихое фоновое обновление (поллинг обновляемой ссылки): сидим ТОЛЬКО
     * данные (отчёт/звонки/финансы/эфирное время/структуру/даты) и НЕ
     * трогаем UI-настройки — тип отчёта, merged-выбор, цепочки конверсий.
     * Иначе каждый тик поллинга сбрасывал бы локальные крутилки зрителя
     * (вкладку, порог горячих клиентов, настроенную цепочку).
     */
    dataOnly?: boolean;
}

/**
 * Сидинг Redux-слайсов данными публичного снимка — вместо обычной
 * listener-цепочки загрузки (Bitrix-init на /share не запускается).
 * После гидратации обычные виджеты отчёта рендерятся как в фрейме.
 *
 * Автосейвы (ui-settings и пр.) не срабатывают: их listeners гардятся
 * по app.domain/user, которые на публичной странице пусты.
 */
export const hydrateFromShareSnapshot =
    (payload: ShareLinkPublicResponseDto, options?: HydrateShareOptions) =>
    (dispatch: AppDispatch) => {
        const ui = payload.ui as unknown as Partial<ShareUiBlob>;
        const report = (payload.report ?? []) as unknown as ReportData[];
        const dataOnly = options?.dataOnly ?? false;

        // Публичный read-only режим: имена пользователей не кликабельны
        // (у публики нет доступа к user-report). Ставим один раз при первой
        // гидратации; поллинг (dataOnly) не трогает.
        if (!dataOnly) {
            dispatch(appActions.setPublicMode(true));
        }

        // 1. Тип отчёта и локальные настройки виджетов — до данных,
        //    чтобы первый рендер сразу был в нужном виде. При dataOnly
        //    пропускаем: это выбор зрителя, поллинг его не перетирает.
        if (!dataOnly && ui.reportType !== undefined) {
            dispatch(reportTypeActions.setCurrentReportType(ui.reportType));
        }
        if (!dataOnly && ui.mergedSelection) {
            dispatch(
                mergedReportActions.setSelectedUsers(
                    ui.mergedSelection.selectedUsers ?? [],
                ),
            );
            dispatch(
                mergedReportActions.setSelectedActions(
                    ui.mergedSelection.selectedActions ?? [],
                ),
            );
        }
        // Конфиги блоков конверсий: новые ссылки несут per-scope конфиги,
        // старые — только цепочку бывшей вкладки (фолбэк на merged).
        if (!dataOnly) {
            if (ui.conversionsWidget) {
                (['kpi', 'callings', 'merged'] as const).forEach(scope => {
                    const patch = ui.conversionsWidget?.[scope];
                    if (patch) {
                        dispatch(
                            conversionsActions.setWidgetConfig({
                                scope,
                                patch,
                            }),
                        );
                    }
                });
            } else if (ui.conversionsTab) {
                dispatch(
                    conversionsActions.setWidgetConfig({
                        scope: 'merged',
                        patch: ui.conversionsTab,
                    }),
                );
            }
        }

        // 2. Даты периода (для заголовка и листов Excel).
        if (ui.date?.from) {
            dispatch(
                reportActions.setChangedDate({
                    typeOfDate: ReportDateType.FROM,
                    value: ui.date.from,
                }),
            );
        }
        if (ui.date?.to) {
            dispatch(
                reportActions.setChangedDate({
                    typeOfDate: ReportDateType.TO,
                    value: ui.date.to,
                }),
            );
        }

        // 3. Структура отделов (разбивки, рейтинги, excel-структура).
        if (ui.department) {
            dispatch(
                departmentActions.setStructure({
                    isMulti: ui.department.isMulti,
                    multipleTag: ui.department.multipleTag,
                    departments: ui.department.departments,
                    currentUser: ui.department.currentUser!,
                    visibleUsers: ui.department.visibleUsers,
                    visibleGroups: ui.department.visibleGroups,
                    isHeadManager: ui.department.isHeadManager,
                    defaultSelected: ui.department.defaultSelected,
                }),
            );
        }

        // 4. Статистика звонков.
        dispatch(
            callingStatisticsActions.setFetched(
                (payload.callings ?? []) as unknown as ReportCallingData[],
            ),
        );

        // 4б. Финансы и эфирное время из снимка. requestKey строим из тех же
        // значений, что сидим в стор, — гарды thunks отсекут live-запросы
        // (плюс на /share они гардятся по пустому app.domain).
        const assignedIds = (ui.department?.defaultSelected ?? [])
            .map(u => Number(u.ID))
            .filter(Boolean);
        const from = ui.date?.from ?? '';
        const to = ui.date?.to ?? '';

        const finance = payload.finance as unknown as {
            closed: FinanceClosedReport | null;
            hotByThreshold: Partial<
                Record<FinanceHotThreshold, FinanceHotReport>
            >;
        } | null;
        if (finance && (finance.closed || finance.hotByThreshold)) {
            dispatch(
                financeActions.seedSnapshot({
                    closed: finance.closed ?? null,
                    hotByThreshold: finance.hotByThreshold ?? {},
                    assignedIds,
                    from,
                    to,
                }),
            );
        }

        const airtime = payload.airtime as unknown as AirtimeReport | null;
        if (airtime) {
            const airtimeKey = `${from}|${to}|${[...assignedIds]
                .sort((a, b) => a - b)
                .join('_')}`;
            dispatch(airtimeActions.teamPending({ requestKey: airtimeKey }));
            dispatch(airtimeActions.teamReady(airtime));
        }

        // 5. Отчёт + показатели (current по сохранённому фильтру создателя).
        dispatch(
            reportActions.setFetchedReport({
                report,
                dateFieldId: '',
                actionFieldId: '',
            }),
        );
        if (report.length) {
            const actions = (report[0]?.kpi ?? []).map(
                kpiItem => kpiItem.action,
            ) as Filter[];
            const currentFilter = ui.reportFilter?.length
                ? ui.reportFilter
                : null;
            dispatch(
                reportActions.setFetchedActions({ actions, currentFilter }),
            );
            dispatch(
                reportActions.setFetchedFilter({
                    filter: actions,
                    currentFilter,
                }),
            );
        }
    };
