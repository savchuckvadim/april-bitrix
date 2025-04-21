"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, BarProps, RectangleProps } from "recharts"
import { TooltipProps } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@workspace/ui/components/chart"
import { FC } from "react"
// const chartData = [
//   { browser: "chrome", visitors: 187, fill: "var(--color-chrome)" },
//   { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//   { browser: "firefox", visitors: 275, fill: "var(--color-firefox)" },
//   { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//   { browser: "other", visitors: 90, fill: "var(--color-other)" },
// ]

const chartConfig = {
    visitors: {
        label: "количество",
    },
    chrome: {
        label: "Chrome",
        color: "hsl(var(--chart-1))",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
    },
    firefox: {
        label: "Firefox",
        color: "hsl(var(--chart-3))",
    },
    edge: {
        label: "Edge",
        color: "hsl(var(--chart-4))",
    },
    other: {
        label: "Other",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig

export interface ChartTotalData {
    name: string
    value: number
    color: string
}
interface ChartTotalProps {
    title: string
    chartData: ChartTotalData[]
    period: string
    colors: string[]
}
export const ChartTotal: FC<ChartTotalProps> = ({ chartData, title, period, colors }) => {
  let count = 0
    for (const data of chartData) {
        chartConfig[data.name as keyof typeof chartConfig] = {
            label: data.name.slice(0, 5)+'...',
            color: `hsl(var(--chart-${count}))`
        }
        count++
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {/* <CardDescription>{period}</CardDescription> */}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value: string) =>
                                chartConfig[value as keyof typeof chartConfig]?.label
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="value"
                            strokeWidth={12}
                            radius={5}
                            className="fill-primary"
                         />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    {title} <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Данные отображены за период {period}
                </div>
            </CardFooter>
        </Card>
    )
}



const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null

  const item = payload[0] // всегда один для Bar
  return (
    <div className="rounded-md border bg-white p-4  text-sm">
      <div className="font-semibold text-black">{item?.payload?.name}</div>
      <div className="text-muted-foreground">Количество: {item?.value}</div>
    </div>
  )
}
