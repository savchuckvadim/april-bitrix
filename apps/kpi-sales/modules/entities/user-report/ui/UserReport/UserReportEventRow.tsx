'use client'

import React from 'react';
import { IUserReportItem } from "../../type/user-report.type";
import { useUserReportItem } from '../../hooks/user-report-item.hook';
import Link from 'next/link';
import { Tooltip } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';

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
        companyBxLink,
        listItemBxLink,
    } = useUserReportItem(item);

    // Определяем, нужно ли добавить разделитель между группами компаний
    const currentCompany = item.sales_kpi_crm_company?.value?.value?.toString() || '';
    const showDivider = groupByCompany && prevCompany && prevCompany !== currentCompany;
    const isFirstInGroup = groupByCompany && (item as any).isFirstInGroup;
    const groupSize = (item as any).groupSize || 1;

    debugger;
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
                                    companyBxLink ? <Link href={companyBxLink} target="_blank">
                                        {company}
                                    </Link> : <p>{company}</p>} />



                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {groupSize} событий
                            </span>
                        </div>
                    ) : groupByCompany ? (
                        <div className="text-foreground hover:text-primary text-sm italic">↳</div>
                    ) : (
                        companyBxLink ? <Tooltip content={'открыть в crm'}
                            children={
                                <Link
                                    className='text-foreground hover:text-primary'
                                    href={companyBxLink}
                                    target="_blank">
                                    {company}
                                </Link>
                            } />
                            : <p>{company}</p>
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
                    {listItemBxLink ? <Tooltip content={'открыть элемент kpi в crm'}
                        children={<Link
                            style={{
                                cursor: 'pointer',
                            }}

                            href={listItemBxLink ?? ''} target="_blank">
                            <textarea
                                style={{
                                    cursor: 'pointer',
                                }}

                                className='h-24 w-full min-w-[270px] resize-none overflow-hidden hover:text-primary' disabled={true}>
                                {comment || '- нет комментария -'}
                            </textarea>
                        </Link>
                        } /> : <p>{comment || '- нет комментария -'}</p>}
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
                {/* <td className="px-3 py-2 text-gray-600">
                    {initiative}
                </td>
                <td className="px-3 py-2 text-gray-600">
                    {tag}
                </td>
                <td className="px-3 py-2 text-gray-600">
                    {communication}
                </td> */}
            </tr>
        </>
    );
};
