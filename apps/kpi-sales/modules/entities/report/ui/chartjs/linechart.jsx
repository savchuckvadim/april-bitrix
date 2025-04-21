// import React, { useState } from "react"
// import { Line } from "react-chartjs-2"
// import getChartColorsArray from "../../Common/Chart/ChartsDynamicColor";
// import { Chart, registerables } from 'chart.js';
// Chart.register(...registerables);

// const LineChart = ({ dataColors, report }) => {
//   var lineChartColor = getChartColorsArray(dataColors);

//   console.log('line report')
//   console.log(report)

//   const periods = report.kpi[0].periods
//   const userName = `${report.user.NAME} ${report.user.LAST_NAME}`
//   const currentAction = report.kpi[0].action

//   const totalValues = periods.map(period => period.count)
//   const periodsNames = periods.map(period => period.end)

//   console.log('totalValues')
//   console.log(totalValues)


//   const data = {
//     labels: periodsNames,
//     //  [
//     //   "January",
//     //   "February",
//     //   "March",
//     //   "April",
//     //   "May",
//     //   "June",
//     //   "July",
//     //   "August",
//     //   "September",
//     //   "October",
//     // ],
//     datasets: [
//       {
//         label: `${userName}`,
//         fill: true,
//         lineTension: 0.5,
//         backgroundColor: lineChartColor[0],
//         borderColor: lineChartColor[1],
//         borderCapStyle: "butt",
//         borderDash: [],
//         borderDashOffset: 0.0,
//         borderJoinStyle: "miter",
//         pointBorderColor: lineChartColor[1],
//         pointBackgroundColor: "#fff",
//         pointBorderWidth: 1,
//         pointHoverRadius: 5,
//         pointHoverBackgroundColor: lineChartColor[1],
//         pointHoverBorderColor: "#fff",
//         pointHoverBorderWidth: 2,
//         pointRadius: 1,
//         pointHitRadius: 10,
//         data: totalValues
//         // [65, 59, 80, 81, 56, 55, 40, 55, 30, 80],
//       },
//       // {
//       //   label: "Monthly Earnings",
//       //   fill: true,
//       //   lineTension: 0.5,
//       //   backgroundColor: "rgba(235, 239, 242, 0.2)",
//       //   borderColor: "#ebeff2",
//       //   borderCapStyle: "butt",
//       //   borderDash: [],
//       //   borderDashOffset: 0.0,
//       //   borderJoinStyle: "miter",
//       //   pointBorderColor: "#ebeff2",
//       //   pointBackgroundColor: "#fff",
//       //   pointBorderWidth: 1,
//       //   pointHoverRadius: 5,
//       //   pointHoverBackgroundColor: "#ebeff2",
//       //   pointHoverBorderColor: "#eef0f2",
//       //   pointHoverBorderWidth: 2,
//       //   pointRadius: 1,
//       //   pointHitRadius: 10,
//       //   data: totalValues
//       //   // [80, 23, 56, 65, 23, 35, 85, 25, 92, 36],
//       // },
//     ],
//   }
//   var options = {
//     scales: {
//       x: {
//         // x-axis configuration options
//       },
//       y: {
//         ticks: {
//           max: 100,
//           min: 20,
//           stepSize: 10
//         }
//       }
//     }
//   };

//   return <Line width={751} height={300} data={data} options={options} />
// }

// export default LineChart;