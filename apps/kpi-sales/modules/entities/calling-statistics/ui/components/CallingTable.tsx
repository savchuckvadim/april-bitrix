import React from 'react'
import { RTable } from '@/modules/shared'
import { getCallingStatisticsTableData } from '../../lib/ui-util'
import { ReportCallingData } from '../../type/calling-type'

export default function CallingTable({ data }: { data: ReportCallingData[] }) {

    const tableData = getCallingStatisticsTableData(data)

    return (
        <RTable {...tableData} />
    )
}
