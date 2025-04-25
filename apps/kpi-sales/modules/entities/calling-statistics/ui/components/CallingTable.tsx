import React from 'react'
import { RTable } from '@/modules/shared'
import { getCallingStatisticsTableData } from '../../lib/ui-util'
import { ReportCallingData } from '../../type/calling-type'

interface CallingTableProps {
    data: ReportCallingData[]
}
export default function CallingTable({ data }: CallingTableProps) {

    if (!data || !data.length) return null
    const tableData = getCallingStatisticsTableData(data)

    return (
        <RTable {...tableData} />
    )
}
