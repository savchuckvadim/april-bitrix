// import { Card, CardBody, CardTitle, Col, Row } from "reactstrap"
// import KPIChart from "../chartjs/KPIChart"
// import { useState } from "react"
// import { getColors, getMediumData, getTotalData } from "@/utils/reducers-utils/report/report-utils"
// import ReportInfo from "../widget/ReportInfo"

// const GraficBoard = ({ report, isCallings, size }) => {
//     let total = 0
//     let medium = 0
//     let sales = 0
//     const boardName = 'Планирование и KPI'
//     report.forEach(urep => {
//         const userKpi = urep.kpi.find(kpi => kpi.action == 'Презентация проведена')

//         if (userKpi) {
//             total = total + userKpi.count

//         }
//     });

//     medium = (total / report.length).toFixed(0)
//     const [isShwoing, setIsShowing] = useState(true)
//     const [isTotalShwoing, setIsTotalShowing] = useState(false)
//     const colors = getColors(report && report.length && report[0].kpi)
//     const jsonColors = JSON.stringify(colors, null, 2);
//     const totalKPI = getTotalData(report);
//     const mediumKPI = getMediumData(report, totalKPI)

//     return (
//         <Col lg={size}>
//             <Card>
//                 <CardBody>
//                     <Row className="d-flex flex-row align-items-start justify-content-between">
//                         <Col className="d-flex align-items-start justify-content-start">
//                             <CardTitle className="mb-4">{boardName}</CardTitle>
//                         </Col>
//                         <Col className="d-flex align-items-start justify-content-end">
//                             <p className="mb-1 text-primary"
//                                 style={{
//                                     cursor: 'pointer'
//                                 }}
//                                 onClick={() => setIsShowing(!isShwoing)}
//                             >{isShwoing ? 'Скрыть' : 'Показать'}</p>

//                         </Col>
//                     </Row>
//                     {isShwoing && <>
//                         <div className="col-12 d-flex justify-content-end">
//                             <p className="mb-4 text-primary"
//                                 style={{
//                                     cursor: 'pointer'
//                                 }}
//                                 onClick={() => setIsTotalShowing(!isTotalShwoing)}
//                             >{isTotalShwoing ? 'Скрыть Общие' : 'Показать Общие'}</p>
//                         </div>
//                         {isTotalShwoing && <Row className="justify-content-center">
//                             <Col sm={3}>
//                                 <div className="text-center">
//                                     {/* <h5 className="mb-0">{total}</h5> */}
//                                     <ReportInfo report={totalKPI} />
//                                     <p className="text-muted text-truncate">Всего</p>
//                                 </div>
//                             </Col>
//                             <Col sm={3}></Col>
//                             <Col sm={3}>
//                                 <div className="text-center">
//                                     {/* <h5 className="mb-0">{medium}</h5> */}
//                                     <ReportInfo report={mediumKPI} />
//                                     <p className="text-muted text-truncate">В среднем</p>
//                                 </div>
//                             </Col>
//                             {/* <Col sm={3}>
//                                 <div className="text-center">

//                                     <ReportInfo report={totalKPI} />
//                                     <p className="text-muted text-truncate">В среднем в день</p>
//                                 </div>
//                             </Col> */}
//                         </Row>}

//                         <div id="bar" className="chartjs-render-monitor">
//                             <KPIChart dataColors={jsonColors}
//                                 report={report}
//                                 isCallings={isCallings}
//                             />
//                         </div>
//                     </>}
//                 </CardBody>
//             </Card>
//         </Col>
//     )
// }

// export default GraficBoard
