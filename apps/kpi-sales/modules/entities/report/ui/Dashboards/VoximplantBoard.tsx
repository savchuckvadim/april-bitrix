// import { Card, CardBody, CardTitle, Col, Row } from "reactstrap"
// import KPIChart from "../chartjs/KPIChart"
// import VoximplantChart from "../chartjs/BitrixCallingsChart"
// import { useState } from "react"
// import { useAppSelector } from "@/hooks/redux"
// import { ReportStateType } from "@/redux/reducers/report/report-reducer"
// import { getFiltredCallReport } from "@/utils/reducers-utils/report/report-utils"


// const VoximplantBoard = () => {
//     let total = 0
//     let medium = 0
//     let sales = 0
//     const boardName = 'Фактические звонки'
//     //TODO
//     const isCallingFetched = useAppSelector(state => (state.report as ReportStateType).calling.isFetched)
//     const stateReport = useAppSelector(state => (state.report as ReportStateType).calling.items)
//     const department = useAppSelector(state => state.departament.current)

//     const report = stateReport && getFiltredCallReport(stateReport, department)



//     return (
//         <Col lg={12}>
//             {isCallingFetched && report && report.length && <Card>
//                 <CardBody>
//                     <CardTitle className="mb-4">{boardName}</CardTitle>

//                     {/* <Row className="justify-content-center">

//                         <Col sm={3}>
//                             <div className="text-center">
//                                 <h5 className="mb-0">{total}</h5>
//                                 <p className="text-muted text-truncate">Всего</p>
//                             </div>
//                         </Col>
//                         <Col sm={3}>
//                             <div className="text-center">
//                                 <h5 className="mb-1">{medium}</h5>
//                                 <p className="text-muted text-truncate">В среднем</p>
//                             </div>
//                         </Col>
//                         <Col sm={3}>
//                             <div className="text-center">
//                                 <h5 className="mb-0">1</h5>
//                                 <p className="text-muted text-truncate">В среднем в день</p>
//                             </div>
//                         </Col>
//                     </Row> */}
//                     {/* <Row className="justify-content-between">
//                         <Col sm={size}> */}
//                     <div id="bar" className="chartjs-render-monitor">
//                         <VoximplantChart dataColors='[
//                             "rgba(133, 212, 212, 1)" ,
//                             "rgba(106, 180, 242, 1)", 
//                             "rgba(14, 201, 111, 0.8)", 
//                             "rgba(20, 191, 213, 0.8)", 
//                             "rgba(151, 103, 200, 0.8)", 
//                             "rgba(104, 54, 153, 0.8)", 
//                             "rgba(255, 13, 334, 0.8)", 
//                             "rgba(104, 54, 253, 0.8)",
//                             "rgba(151, 103, 200, 0.8)",
//                             "rgba(20, 191, 213, 0.8)", 
//                             "rgba(14, 201, 111, 0.8)"]'
//                             report={report}
//                             part={1}

//                         />
//                     </div>
//                     {/* </Col>
                       


//                     </Row> */}

//                 </CardBody>
//             </Card>}
//         </Col>
//     )
// }


// export default VoximplantBoard