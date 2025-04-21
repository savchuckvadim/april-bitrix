// import { ReportCallingData, ReportData } from "@/types/report/report-type"
// import { FC } from "react"
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"
// import { useAppSelector } from "@/hooks/redux"
// import { ReportStateType } from "@/redux/reducers/report/report-reducer"
// import { getFiltredCallReport } from "@/utils/reducers-utils/report/report-utils"


// const CallingReportTable = () => {
//     const isCallingFetched = useAppSelector(state => (state.report as ReportStateType).calling.isFetched)
//     const report = useAppSelector(state => (state.report as ReportStateType).calling.items)
//     const department = useAppSelector(state => state.departament.current)
//     const filtredReport = report && getFiltredCallReport(report, department)


//     if (isCallingFetched && filtredReport && filtredReport.length) {



//         const reportTableItems = filtredReport.map((userReport, userIndex) => {
//             return <TableRow
//                 key={`report-${userReport.user.ID}-${userIndex}`}
//                 sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
//             >
//                 <TableCell component="th" scope="row"
//                     key={`report-${userReport.user.ID}-userName`}
//                     sx={{ minWidth: "190px !important", padding: "3px !important" }}


//                 >
//                     <p
//                         className='document-prices-cell-content--bold'>
//                         {userReport.userName}
//                     </p>

//                 </TableCell>
//                 {/* {userReport.callings.map(action => (
//                     <TableCell align="right">
//                         <p
//                             className='document-prices-cell-content'>{
//                                 action.count
//                             }</p></TableCell>
//                 ))} */}
//                 {userReport.callings.map(call => (
//                     <TableCell align="right">
//                         <p
//                             className='document-prices-cell-content'>{
//                                 call.count
//                             }</p></TableCell>
//                 ))}
//             </TableRow>

//         })
//         const reportTableHeader = <TableRow>
//             <TableCell
//                 key={`report-table-header-manager`}
//                 align={"left"}
//                 sx={{
//                     minWidth: "190px !important",
//                     padding: "3px !important"

//                 }}>
//                 <p
//                     className='document-prices-cell-content--bold'
//                 >
//                     Менеджер
//                 </p>
//             </TableCell>
//             {/* {report[0].callings
//                 .map((column, i) => {

//                     return <TableCell
//                         key={`document-price-th-${i}`}
//                         align={"right"}>
//                         <p
//                             className='document-prices-cell-content--bold'>
//                             {column.action.name}
//                         </p>
//                     </TableCell>
//                 })} */}
//             {filtredReport[0].callings
//                 .map((column, i) => {

//                     return <TableCell
//                         key={`document-price-th-${i}`}
//                         align={"right"}>
//                         <p
//                             className='document-prices-cell-content--bold'>
//                             {column.action}
//                         </p>
//                     </TableCell>
//                 })}

//         </TableRow>



//         return (
//             <TableContainer
//                 sx={{ marginBottom: 1 }}
//             // component={Paper}
//             >
//                 <Table
//                     // sx={{ minWidth: 650 }}
//                     size="small"
//                     aria-label="simple table">
//                     {/* //@ts-ignore */}
//                     <TableHead
//                     // variant="head".
//                     >
//                         {reportTableHeader}
//                     </TableHead>
//                     <TableBody>

//                         {
//                             reportTableItems
//                         }

//                     </TableBody>
//                 </Table>
//             </TableContainer >
//         )
//     } else {
//         return <></>
//     }


// }

// export default CallingReportTable