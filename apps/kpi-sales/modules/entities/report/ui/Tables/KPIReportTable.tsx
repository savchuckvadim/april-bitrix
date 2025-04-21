import React from 'react';
import { ReportData } from '../../model/types/report/report-type';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Card } from '@workspace/ui/components/card';

interface KPIReportTableProps {
    report: ReportData[];
}

const KPIReportTable: React.FC<KPIReportTableProps> = ({ report }) => {
    if (!report || !report.length || !report[0]?.kpi) {
        return <div>Нет данных для отображения</div>;
    }

    return (
        <Card className="my-4 p-4 bg-popover text-primary">
            <Table className='bg-popover text-primary'>
                <TableHeader >
                    <TableRow>
                        <TableHead className="w-[190px] bg-popover text-primary ">Менеджер</TableHead>
                        {report[0].kpi.map((column, i) => (
                            <TableHead key={`column-${i}`} className="text-right bg-popover text-primary">
                                {column.action.name}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {report.map((userReport, userIndex) => (
                        <TableRow key={`report-${userReport.user.ID}-${userIndex}`}>
                            <TableCell className="font-medium">
                                {userReport.userName}
                            </TableCell>
                            {userReport.kpi.map((action, index) => (
                                <TableCell key={`action-${index}`} className="text-right">
                                    {action.count}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
};

export default KPIReportTable;