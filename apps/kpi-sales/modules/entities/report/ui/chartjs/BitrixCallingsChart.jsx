import React from "react"
import { Bar } from "react-chartjs-2"
import getChartColorsArray from "../../../calling-statistics/lib/color-util";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


const BitrixCallingsChart = ({ dataColors, report, part }) => {
  var barChartColor = getChartColorsArray(dataColors);

  const dataSets = []
  const datasetsNames = report[0].callings.map(call => call.action)

  const usersNames = report.map(rep => rep.userName)
  report[0].callings.forEach((basecall, i) => {
    let total = 0
    const dataCounts = []

    report.forEach(urep => {

      let usercall = null

    
        usercall = urep.callings.find(call => call.action == basecall.action && datasetsNames.includes(call.action))
      

      if (usercall) {

        total = total + usercall.count
        dataCounts.push(usercall.count)
      }


    });
    // const colorIndex = isCallings ? i + 1 : i + 3


    if (total) {
      dataSets.push(
        {
          label: basecall.action,
          backgroundColor: barChartColor[i],
          borderColor: barChartColor[i],
          borderWidth: 1,
          hoverBackgroundColor: barChartColor[i],
          hoverBorderColor: barChartColor[i],
          data: dataCounts

        }
      )
    }

  })


  const data = {
    labels: usersNames,
    datasets: dataSets,
    // : [
    //   {
    //     label: "Презентации",
    //     backgroundColor: barChartColor[0],
    //     borderColor: barChartColor[0],
    //     borderWidth: 1,
    //     hoverBackgroundColor: barChartColor[1],
    //     hoverBorderColor: barChartColor[1],
    //     data: dataCounts
    //   },
    // ],
  }

  const option = {
    scales: {
      x: {
        barPercentage: 0.9
      },
      y: {

      }
    }
  }

  return <Bar width={751} height={300} data={data} options={option} />
}

export default BitrixCallingsChart
