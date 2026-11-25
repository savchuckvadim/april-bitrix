'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
// Прямой путь, не index сущности: на странице отчёта нужна одна константа.
import { CALLS_LIST_PATH } from '@/modules/entities/calls-list/lib/calls-list.const';
import type { EReportType } from '../consts/report-type.consts';
import { reportTypeHref, type ReportNavItem, type ReportNavPage } from '../lib/report-nav';

const TAB_CLASS = 'text-xs h-6 px-2';

interface ReportNavTabProps {
    item: ReportNavItem;
    /** Где показан ряд: в отчёте, на странице «Разборов звонков» или настроек. */
    page: ReportNavPage;
    /** Открытая вкладка отчёта (на странице разборов активна не она). */
    current: EReportType;
    onSelectType: (type: EReportType) => void;
}

/**
 * Одна вкладка ряда. В отчёте типы переключаются кнопками, «Разборы звонков» —
 * ссылка на страницу. На странице разборов наоборот: «Разборы звонков» —
 * активная кнопка, типы отчёта — ссылки в отчёт на нужную вкладку (клиентский
 * переход: сессия портала и стор остаются). На странице настроек активной
 * вкладки нет: и типы отчёта, и «Разборы звонков» — ссылки.
 */
export const ReportNavTab = ({ item, page, current, onSelectType }: ReportNavTabProps) => {
    if (item.kind === 'calls') {
        return page === 'calls' ? (
            <Button variant="default" className={TAB_CLASS} aria-current="page">
                {item.label}
            </Button>
        ) : (
            <Button asChild variant="outline" className={TAB_CLASS}>
                <Link href={CALLS_LIST_PATH}>{item.label}</Link>
            </Button>
        );
    }

    const { type, label } = item;
    if (page !== 'report') {
        return (
            <Button asChild variant="outline" className={TAB_CLASS}>
                <Link href={reportTypeHref(type)} onClick={() => onSelectType(type)}>
                    {label}
                </Link>
            </Button>
        );
    }
    return (
        <Button
            variant={current === type ? 'default' : 'outline'}
            className={TAB_CLASS}
            onClick={() => onSelectType(type)}
        >
            {label}
        </Button>
    );
};
