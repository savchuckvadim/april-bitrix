// import { Card, CardBody, CardTitle, Col, Row } from "reactstrap"
// import KPIChart from "../chartjs/KPIChart"
// import { KPI, ReportData } from "@/types/report/report-type";
// import { FC, useState } from "react";
// import { getColors, getMediumData, getTotalData } from "@/utils/reducers-utils/report/report-utils";

// interface KPITotalBoard {
//     report: Array<ReportData>;
//     // isCallings: boolean;
//     // size: number;
// }

// const KPITotalBoard: FC<KPITotalBoard> = ({ report }) => {
//     let total = 0
//     let medium = 0
//     let sales = 0
//     const boardName = 'Общие и средние показатели и KPI'

//     // const totalKPI = [

//     // ] as KPI[]
//     // report.forEach(urep => {
//     //     urep.kpi.forEach(kpi => {
//     //         const totalItem = totalKPI.find((item: KPI) => item.id === kpi.id) as KPI | undefined
//     //         if (totalItem) {
//     //             totalItem.count += kpi.count
//     //         } else {
//     //             totalKPI.push({ ...kpi })
//     //         }

//     //     })

//     // })

//     // const mediumKPI = [

//     // ] as KPI[]
//     // 

//     // totalKPI.forEach(kpi => {

//     //     mediumKPI.push({
//     //         ...kpi,
//     //         count: Number((kpi.count / report.length).toFixed(0))
//     //     })


//     // })
//     const totalKPI = getTotalData(report);
//     const mediumKPI = getMediumData(report, totalKPI)
//     const totalReport = [
//         {
//             kpi: totalKPI,
//             userName: 'Всего'
//         },
//         {
//             kpi: mediumKPI,
//             userName: 'В среднем'
//         },


//     ] as Array<ReportData>
//     const [isShwoing, setIsShowing] = useState(false)
//     const colors = getColors(totalKPI)
//     const jsonColors = JSON.stringify(colors, null, 2);
//     return (
//         <Col lg={12}>
//             <Card>
//                 <CardBody>
//                     <Row className="d-flex flex-row align-items-start justify-content-between">
//                         <Col className="d-flex align-items-start justify-content-start">
//                             <CardTitle className="mb-4">{boardName}</CardTitle>
//                         </Col>
//                         <Col className="d-flex align-items-start justify-content-end">
//                             <p className="mb-4 text-primary cursor-pointer"
//                             style={{
//                                 cursor: "pointer", fontWeight: "bold"
//                             }}
//                                 onClick={() => setIsShowing(!isShwoing)}
//                             >{isShwoing ? 'Скрыть' : 'Показать'}</p>

//                         </Col>
//                     </Row>


//                     {isShwoing && <div id="bar" className="chartjs-render-monitor">
//                         <KPIChart
//                             dataColors={jsonColors}
//                             report={totalReport}

//                         />
//                     </div>}
//                 </CardBody>
//             </Card>
//         </Col>
//     )
// }


// export default KPITotalBoard