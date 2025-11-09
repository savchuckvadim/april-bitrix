'use client';
import React, { FC } from 'react';
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';
import { Tooltip, TooltipContent } from '@workspace/ui/components/tooltip';
import { TooltipTrigger } from '@workspace/ui/components/tooltip';

import Link from 'next/link';

export interface RTableProps {
    code: string;
    firstCellName: string;
    data: {
        id?: number;
        name: string;
        actions: { name: string; value: number }[];
    }[];
    withLink?: boolean;
    onClick?: (id: number) => void;
}

const RTable: FC<RTableProps> = ({ code, data, firstCellName, withLink, onClick }) => {

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <ShadcnTable className="bg-popover text-primary">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[190px] bg-popover text-primary ">
                            {firstCellName}
                        </TableHead>
                        {data?.[0]?.actions.map((report, i) => (
                            <Tooltip
                                key={`tooltip-rtable-head-${code}-column-${i}`}
                            >
                                <TooltipTrigger asChild>
                                    <TableHead
                                        key={`head-${code}-column-${i}`}
                                        className="text-right bg-popover text-primary"
                                    >
                                        {/* {report.name.length > 19 ? report.name.slice(0, 20) + '...' : report.name} */}
                                        {report.name}
                                    </TableHead>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                    {report.name}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((report, userIndex) => (
                        <TableRow
                            key={`report-${code}-${report.name}-${userIndex}`}
                        >
                            <TableCell className="font-medium">

                                {withLink && report.id ?
                                    <Link href={`/report/user?userId=${report.id}`} className="text-primary hover:text-blue-700">
                                        {report.name}
                                    </Link>

                                    : <p onClick={() => report.id && onClick?.(report.id)}>
                                        {report.name}
                                    </p>}
                            </TableCell>
                            {report.actions.map((action, index) => (
                                <TableCell
                                    key={`cell-${code}-action-${index}`}
                                    className="text-right"
                                >
                                    {action.value}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </ShadcnTable>
        </Card>
    );
};

export default RTable;
