// import React from "react"
// import { Bar } from "react-chartjs-2"
// import getChartColorsArray from "../../Common/Chart/ChartsDynamicColor";
// import { Chart, registerables } from 'chart.js';
// Chart.register(...registerables);

// const KPIChart = ({ dataColors, report }) => {
//   var barChartColor = getChartColorsArray(dataColors);

//   const dataSets = []
//   const datasetsNames = report[0].kpi.map(kpi => kpi.action.name)

//   // [
//   //   'Звонок запланирован',
//   //   'Звонок совершен',
//   //   'Звонок отказ',

//   // ]
//   const usersNames = report.map(rep => rep.userName)
//   report[0].kpi.forEach((basekpi, i) => {
//     let total = 0
//     const dataCounts = []

//     report.forEach(urep => {

//       let userKpi = null

//       // if (isCallings) {
//       userKpi = urep.kpi.find(kpi => kpi.action.innerCode == basekpi.action.innerCode && datasetsNames.includes(kpi.action.name))
//       // } else {
//       //   userKpi = urep.kpi.find(kpi => kpi.action == basekpi.action && !datasetsNames.includes(kpi.action))
//       // }

//       if (userKpi) {

//         total = total + userKpi.count
//         dataCounts.push(userKpi.count)
//       }

//     });
//     // const colorIndex = isCallings ? i + 1 : i + 3
//     if (total) {
//       dataSets.push(
//         {
//           label: basekpi.action.name,
//           backgroundColor: barChartColor[i],
//           borderColor: barChartColor[i],
//           borderWidth: 1,
//           hoverBackgroundColor: barChartColor[i],
//           hoverBorderColor: barChartColor[i],
//           data: dataCounts

//         }
//       )
//     }

//   })

//   const data = {
//     labels: usersNames,
//     datasets: dataSets,
//     // : [
//     //   {
//     //     label: "Презентации",
//     //     backgroundColor: barChartColor[0],
//     //     borderColor: barChartColor[0],
//     //     borderWidth: 1,
//     //     hoverBackgroundColor: barChartColor[1],
//     //     hoverBorderColor: barChartColor[1],
//     //     data: dataCounts
//     //   },
//     // ],
//   }

//   const option = {
//     scales: {
//       x: {
//         barPercentage: 10.9
//       },
//       y: {

//       }
//     }
//   }

//   return <Bar width={751} height={300} data={data} options={option} />
// }

// export default KPIChart
