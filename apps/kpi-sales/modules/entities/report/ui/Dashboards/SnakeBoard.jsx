// import { Card, CardBody, CardTitle, Col, Row } from "reactstrap"
// import LineChart from "../chartjs/linechart"
// import { useEffect, useState } from "react"

// const SnakeBoard = ({
//     detalization, departament, actions, size,
//     setDetalizationProps
// }) => {
//     let total = 0
//     let medium = 0
//     let sales = 0
//     const boardName = 'Детализация за период'
//     const [currentUser, setCurrentUser] = useState(
//         null
//     )
//     const [currentAction, setCurrentAction] = useState(
//         null
//     )
//     const [currentDepartmen, setCurrentDepartment] = useState(
//         departament.items
//     )

//     const changeDetalizationPropsHandler = (e, type) => {
//         const currentValue = e.target.value
//         setDetalizationProps(type, currentValue)
//     }

//     useEffect(() => {
//         if (detalization && detalization.report && detalization.report.user) {

//             setCurrentUser(detalization.report.user)
//         }
//         if (detalization && detalization.report && detalization.report.kpi && detalization.report.kpi.length) {

//             setCurrentAction(detalization.report.kpi[0].action)
//         }
//         console.log('detalization effect')
//         console.log(detalization)

//     }, [detalization.report])

//     console.log('detalization')

//     console.log(detalization)
//     console.log('actions')

//     console.log(actions)

//     return (
//         <Col lg={size}>
//             <Card>
//                 <CardBody>
//                     <CardTitle className="mb-4">{boardName}</CardTitle>

//                     <Row>
//                         <Col sm={3}>
//                             <label className="col-md-4 col-form-label">Сотрудник</label>
//                             <p className="text mb-1">{currentUser && currentUser.NAME}</p>
//                             <div className="col-md-10">
//                                 <select
//                                     className="form-control"
//                                     onChange={(e) => { changeDetalizationPropsHandler(e, 'user') }}
//                                 >
//                                     {
//                                         currentDepartmen && currentDepartmen.map((user, i) =>
//                                             <option value={user.ID} key={`snake-depart-op-${i}`}>{user.NAME + ' ' + user.LAST_NAME}</option>)
//                                     }

//                                 </select>
//                             </div>
//                         </Col>
//                         <Col sm={3}>
//                             <label className="col-md-4 col-form-label">KPI</label>
//                             <p className="text mb-1">{detalization.report.kpi[0].action}</p>
//                             <div className="col-md-10">
//                                 <select
//                                     className="form-control"
//                                     onChange={(e) => { changeDetalizationPropsHandler(e, 'action') }}
//                                 >
//                                     {
//                                         actions && actions.items && actions.items.length && actions.items.map((action, i) =>
//                                             <option value={action.id} key={`snake-depart-op-${i}`}>{action.name}</option>)
//                                     }

//                                 </select>
//                             </div>
//                         </Col>
//                     </Row>

//                     <Row className="justify-content-center">
//                         {/* <Col sm={4}>
//                             <div className="text-center">
//                                 <h5 className="mb-0">86541</h5>
//                                 <p className="text-muted text-truncate">Activated</p>
//                             </div>
//                         </Col>
//                         <Col sm={4}>
//                             <div className="text-center">
//                                 <h5 className="mb-0">2541</h5>
//                                 <p className="text-muted text-truncate">Pending</p>
//                             </div>
//                         </Col>
//                         <Col sm={4}>
//                             <div className="text-center">
//                                 <h5 className="mb-0">102030</h5>
//                                 <p className="text-muted text-truncate">Deactivated</p>
//                             </div>
//                         </Col> */}
//                     </Row>
//                     {detalization && detalization.report && <div id="lineChart" className="chartjs-render-monitor">
//                         <LineChart
//                             report={detalization.report}
//                             dataColors='["--bs-primary-rgb, 0.2", "--bs-primary", "--bs-light-rgb, 0.2", "--bs-light"]' />
//                     </div>}
//                 </CardBody>
//             </Card>
//         </Col >
//     )
// }

// export default SnakeBoard
