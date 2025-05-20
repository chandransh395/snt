
import * as React from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
}

export function BarChart({
  data,
  categories,
  index,
  colors = ["blue", "green", "amber", "red", "purple"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
}: BarChartProps) {
  const config = Object.fromEntries(
    categories.map((category, i) => [
      category,
      { theme: { light: `hsl(var(--${colors[i % colors.length]}))` } },
    ])
  );

  return (
    <ChartContainer config={config}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 25, left: 5, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey={index}
          tick={{ transform: "translate(0, 10)" }}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          height={40}
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
          <Bar
            key={category}
            dataKey={category}
            fill={`var(--color-${category})`}
            radius={[4, 4, 0, 0]}
            barSize={20}
            stackId={1}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
