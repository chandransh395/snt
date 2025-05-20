
import * as React from "react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
}

export function LineChart({
  data,
  categories,
  index,
  colors = ["blue", "green", "amber", "red", "purple"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
}: LineChartProps) {
  const config = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { 
        theme: { 
          light: `hsl(var(--${colors[i % colors.length]}))`,
          dark: `hsl(var(--${colors[i % colors.length]}))` 
        } 
      },
    ])
  );

  return (
    <ChartContainer config={config}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 25, left: 5, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={index}
          tick={{ transform: "translate(0, 10)" }}
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          width={yAxisWidth}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => valueFormatter(value)}
        />
        <Tooltip
          content={({ active, payload }) => (
            <ChartTooltipContent
              active={active}
              payload={payload}
              formatter={(value) => valueFormatter(Number(value))}
            />
          )}
        />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={`var(--color-${category})`}
            strokeWidth={2}
            dot={{ strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}
