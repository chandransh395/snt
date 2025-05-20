
import * as React from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  yAxisWidth?: number;
  height?: number | string;
  emptyMessage?: string;
}

export function BarChart({
  data,
  categories,
  index,
  colors = ["blue", "green", "amber", "red", "purple"],
  valueFormatter = (value: number) => value.toString(),
  yAxisWidth = 40,
  height = "100%",
  emptyMessage = "No data available",
}: BarChartProps) {
  // Check if data is valid
  const hasValidData = data && data.length > 0 && 
    categories.some(category => data.some(item => item[category] !== undefined));

  // Create config based on categories
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

  if (!hasValidData) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 25, left: 5, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={index}
            tick={{ transform: "translate(0, 10)" }}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            height={40}
            angle={-45}
            textAnchor="end"
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
      </ResponsiveContainer>
    </ChartContainer>
  );
}
