'use client'

import React from 'react';
import { IUserReportItem } from "../../type/user-report.type";
import { useDealsReport } from '@/modules/entities/deals-report/hooks/deals-report.hook';
import { useUserReportItem } from '../../hooks/user-report-item.hook';
import Link from 'next/link';
import { Input } from '@workspace/ui/components/input';
import { Tooltip } from '@/modules/shared';

interface UserReportEventRowProps {
    item: IUserReportItem & {
        isFirstInGroup?: boolean;
        companyName?: string;
        groupSize?: number;
    };
    idx: number;
    groupByCompany?: boolean;
    prevCompany?: string;
}

export const UserReportEventRow: React.FC<UserReportEventRowProps> = ({ item, idx, groupByCompany, prevCompany }) => {
    const { action,
        title,
        domain,
        companyId,
        type,
        comment,
        crm,
        contact,
        company,
        plan_date,
        event_date,
        initiative,
        tag,
        communication
    } = useUserReportItem(item);

    // Определяем, нужно ли добавить разделитель между группами компаний
    const currentCompany = item.service_ork_history_ork_crm_company?.value?.value || '';
    const showDivider = groupByCompany && prevCompany && prevCompany !== currentCompany;
    const isFirstInGroup = groupByCompany && (item as any).isFirstInGroup;
    const groupSize = (item as any).groupSize || 1;

    return (
        <>
            {showDivider && (
                <tr className="bg-gray-100">
                    <td colSpan={8} className="px-3 py-1 border-t-2 border-background-muted"></td>
                </tr>
            )}
            <tr
                className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${groupByCompany ? 'border-l-4 border-transparent hover:border-blue-300' : ''
                    }`}
            >
                <td className="px-3 py-2 text-gray-600">
                    {groupByCompany && isFirstInGroup ? (
                        <div className="flex items-center gap-2 text-foreground hover:text-primary">
                            <Tooltip content={'открыть в crm'}
                                children={
                                    <Link href={`https://${domain}/crm/company/details/${companyId}/`} target="_blank">
                                        {company}
                                    </Link>} />



                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {groupSize} событий
                            </span>
                        </div>
                    ) : groupByCompany ? (
                        <div className="text-foreground hover:text-primary text-sm italic">↳</div>
                    ) : (
                        <Tooltip content={'открыть в crm'}
                            children={
                                <Link className='text-foreground hover:text-primary' href={`https://${domain}/crm/company/details/${companyId}/`} target="_blank">
                                    {company}
                                </Link>
                            } />
                    )}
                </td>
                <td className="px-3 py-2 text-foreground/60 font-medium">
                    {title}
                </td>
                {/* <td className="px-3 py-2 text-gray-900 font-medium">
                {action}
            </td>
            <td className="px-3 py-2 text-gray-600">
                {type}
            </td> */}
                <td className="px-3 py-2 text-gray-500 max-w-xs truncate" title={comment}

                >
                    <Tooltip content={'открыть элемент kpi в crm'}
                        children={<Link
                            style={{
                                cursor: 'pointer',
                            }}

                            href={`https://${domain}/company/lists/93/element/0/${item.id}/?list_section_id=`} target="_blank">
                            <textarea
                                style={{
                                    cursor: 'pointer',
                                }}

                                className='h-24 w-full min-w-[270px] resize-none overflow-hidden hover:text-primary' disabled={true}>
                                {comment || '- нет комментария -'}
                            </textarea>
                        </Link>
                        } />
                </td>
                {/* <td className="px-3 py-2 text-gray-600">
                    {contact}
                </td> */}
                <td className="px-3 py-2 text-gray-600">
                    {event_date}
                </td>
                <td className="px-3 py-2 text-gray-600">
                    {plan_date}
                </td>
                <td className="px-3 py-2 text-gray-600">
                    {initiative}
                </td>
                <td className="px-3 py-2 text-gray-600">
                    {tag}
                </td>
                <td className="px-3 py-2 text-gray-600">
                    {communication}
                </td>
            </tr>
        </>
    );
};
