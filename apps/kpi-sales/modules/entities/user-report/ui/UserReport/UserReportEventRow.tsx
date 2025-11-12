'use client'

import React from 'react';
import { IUserReportItem } from "../../type/user-report.type";
import { useUserReportItem } from '../../hooks/user-report-item.hook';
import Link from 'next/link';
import { Tooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import { getColorCompany } from '../../lib/color-company.ui-util';
import { Badge } from '@workspace/ui/components/badge';
import { BadgeCent, Dot } from 'lucide-react';



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
        companyColorName,
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


    return (
        <>
            {showDivider && (
                <tr className="bg-secondary">
                    <td colSpan={8} className="px-3 py-1 border-t-2 border-background-muted"></td>
                </tr>
            )}
            <tr
                className={` transition-colors cursor-pointer group ${groupByCompany ? 'border-l-4 border-transparent hover:border-blue-300' : ''
                    }`}
            >
                <td className="px-3 py-2 text-primary max-w-md">
                    {groupByCompany && isFirstInGroup ? (
                        <div className="flex items-center gap-2 text-foreground hover:text-primary">
                            <Tooltip content={'открыть в crm'}
                                children={
                                    companyBxLink ? <Link href={companyBxLink} target="_blank">
                                        {company?.TITLE || companyId}          <Badge variant="outline" className={cn(
                                            getColorCompany(company?.color || '')
                                        )}><p className='text-xs'>{companyColorName}</p></Badge>
                                    </Link> : <p>{company?.TITLE || companyId} </p>} />



                            <span className="text-xs text-secondary bg-background/50 px-2 py-1 rounded">
                                {groupSize} событий
                            </span>
                            {/* <span className="text-xs text-secondary  px-2 py-1 rounded">
                                Цвет компании:  <Badge variant="outline" className={cn(
                                    getColorCompany(company?.color || '')
                                )}>{companyColorName}</Badge>
                            </span> */}
                        </div>
                    ) : groupByCompany ? (
                        <div className="text-foreground hover:text-primary text-sm italic">
                            <Dot size={10} />
                        </div>
                    ) : (
                        companyBxLink ? <Tooltip content={'открыть в crm'}
                            children={
                                <Link
                                    className='text-foreground hover:text-primary'
                                    href={companyBxLink}
                                    target="_blank">
                                    {company?.TITLE || companyId}  <Badge variant="outline" className={cn(
                                            getColorCompany(company?.color || '')
                                        )}><p className='text-xs'>{companyColorName}</p></Badge>
                                </Link>
                            } />
                            : <p>{companyId}</p>
                    )}
                </td>

                {/* <td className="px-3 py-2 text-xs text-gray-900 font-medium">

                    <Badge variant="outline" className={cn(
                        getColorCompany(company?.color || '')
                    )}><p className='text-xs'>{companyColorName}</p></Badge>
                </td> */}
                <td className="px-3 py-2 text-foreground/60 font-medium">
                    {title}
                </td>


                <td className="px-3 py-2 text-gray-500 max-w-xs truncate" title={comment}

                >
                    {listItemBxLink ? <Tooltip
                        align='start'
                        content={
                            <div className='max-w-xl max-h-full'>
                                <p>
                                    {comment || 'открыть элемент kpi в crm'}
                                </p>
                            </div>

                        }
                        children={<Link
                            style={{
                                cursor: 'pointer',
                            }}
                            className='text-primary/80 hover:text-primary'
                            href={listItemBxLink ?? ''} target="_blank">
                            {/* <textarea
                                style={{
                                    cursor: 'pointer',
                                }}
                                defaultValue={comment}
                                value={comment || '- нет комментария -'}
                                className='h-24 w-full min-w-[270px] resize-none overflow-hidden hover:text-primary' disabled={true} /> */}

                            {comment || '- нет комментария -'}
                        </Link>
                        } /> : <p className='text-primary-foreground'>{comment || '- нет комментария -'}</p>}
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
