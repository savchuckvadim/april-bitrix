'use client'

import React, { useCallback, useRef, useEffect } from "react";
import { IUserReportItem } from "../../type/user-report.type";
import { Card } from "@workspace/ui/components/card";
import { Loader2 } from "lucide-react";
import { UserReportEventRow } from "./UserReportEventRow";

interface UserReportEventTableProps {
    visibleItems: IUserReportItem[];
    allItems: IUserReportItem[];
    visibleCount: number;
    onLoadMore: () => void;
    groupByCompany: boolean;
}

export const UserReportEventTable: React.FC<UserReportEventTableProps> = ({
    visibleItems,
    allItems,
    visibleCount,
    onLoadMore,
    groupByCompany
}) => {
    const observerRef = useRef<HTMLDivElement | null>(null);
    const hasMore = visibleCount < allItems.length;

    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting) {
                onLoadMore();
            }
        }, { threshold: 0.1 });

        const currentRef = observerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) observer.unobserve(currentRef);
            observer.disconnect();
        };
    }, [hasMore, onLoadMore, visibleCount]);

    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-background-muted border-b border-background-muted sticky top-0 z-10">
                        <tr>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Компания
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Событие
                            </th>
                            {/* <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Действие
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Тип
                            </th> */}
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Комментарий
                            </th>
                            {/* <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Контакт
                            </th> */}   
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Дата события
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Дата следующей коммуникации
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Инициатива
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Тег
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Коммуникация
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-muted divide-y divide-background-muted">
                        {visibleItems.map((item, idx) => {
                            const prevItem = idx > 0 ? visibleItems[idx - 1] : null;
                            const prevCompany = prevItem?.service_ork_history_ork_crm_company?.value?.value || '';

                            return (
                                <UserReportEventRow
                                    key={item.id ?? idx}
                                    item={item}
                                    idx={idx}
                                    groupByCompany={groupByCompany}
                                    prevCompany={prevCompany}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div ref={observerRef} className="flex justify-center py-4 bg-gray-50 border-t border-gray-200">
                    <Loader2 className="animate-spin text-gray-400 w-5 h-5" />
                </div>
            )}
        </Card>
    );
};
