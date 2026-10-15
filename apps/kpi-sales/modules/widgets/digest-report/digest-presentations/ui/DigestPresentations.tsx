'use client';

import { MicroSegmented } from '@workspace/april-ui';
import { ReportGroupTabs } from '@/modules/feature/report-tabs';
import { DigestSection, DigestTile } from '../../digest-section';
import { useDigestPresentations } from '../hooks/use-digest-presentations';
import { PresComplectChart } from './PresComplectChart';
import { PresEmployeeTable } from './PresEmployeeTable';
import { PresFilters } from './PresFilters';
import { PresHistoryTable } from './PresHistoryTable';
import { PresHourlyChart } from './PresHourlyChart';
import { PresRatingList } from './PresRatingList';

const VIEW_OPTIONS = [
    { value: 'chart', label: 'График' },
    { value: 'table', label: 'Таблица' },
];

/**
 * «Презентации»: сделки «ОП Презентации» дня — план руководителя → план в
 * CRM → факт, исходы, комплекты, рейтинг, часы с комментариями, история.
 */
export const DigestPresentations = () => {
    const pres = useDigestPresentations();

    return (
        <DigestSection
            widget="presentations"
            title="Презентации"
            description="Сделки воронки «ОП Презентации» за день: что стояло на день, что проведено, не состоялось, перенесено; комплекты и суммы (со сделки презентации или с основной сделки); комментарии из отчётов менеджеров."
        >
            {!pres.available ? (
                <p className="py-3 text-sm text-muted-foreground">
                    Сделки презентаций недоступны — причина в предупреждениях вверху
                </p>
            ) : !pres.hasAny ? (
                <p className="py-3 text-sm text-muted-foreground">Презентаций за день нет</p>
            ) : (
                <div className="space-y-5">
                    <PresFilters
                        filter={pres.filter}
                        employeeOptions={pres.employeeOptions}
                        onUser={pres.setUser}
                        onStatus={pres.toggleStatus}
                        onCompany={pres.setCompany}
                        onInitiative={pres.setInitiative}
                        onReset={pres.resetFilter}
                    />
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                        {pres.summaryTiles.map(tile => (
                            <DigestTile key={tile.key} tile={tile} />
                        ))}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">По сотрудникам</h4>
                        <ReportGroupTabs
                            presentUserIds={pres.employeeRows.map(row => row.userId)}
                            renderSummary={() => <PresEmployeeTable rows={pres.employeeRows} />}
                            renderSection={userIds => (
                                <PresEmployeeTable
                                    rows={pres.employeeRows.filter(row => userIds.has(row.userId))}
                                />
                            )}
                        />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Рейтинг</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                                {pres.ratings.map(board => (
                                    <PresRatingList key={board.code} board={board} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Комплекты проведённых презентаций</h4>
                            <PresComplectChart stats={pres.complects} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold">История презентаций ({pres.items.length})</h4>
                            <MicroSegmented
                                ariaLabel="Вид истории"
                                size="xs"
                                options={VIEW_OPTIONS}
                                value={pres.view}
                                onChange={pres.setView}
                            />
                        </div>
                        {pres.view === 'chart' ? (
                            <PresHourlyChart
                                buckets={pres.hourly.buckets}
                                itemsByHour={pres.hourly.itemsByHour}
                                range={pres.hourRange}
                                nameOf={pres.nameOf}
                            />
                        ) : (
                            <PresHistoryTable items={pres.items} nameOf={pres.nameOf} domain={pres.domain} />
                        )}
                    </div>
                </div>
            )}
        </DigestSection>
    );
};
