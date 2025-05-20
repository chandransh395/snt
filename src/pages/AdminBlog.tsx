import * as React from "react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  height?: number | string;
  emptyMessage?: string;
}

export function PieChart({
  data,
  category,
  index,
  colors = ["blue", "green", "amber", "red", "purple"],
  valueFormatter = (value: number) => value.toString(),
  height = "100%",
  emptyMessage = "No data available",
}: PieChartProps) {
  // Check if we have valid data
  const hasValidData = data && data.length > 0 && data.some(item => item[category]);

  // Create config based on data
  const config = hasValidData 
    ? Object.fromEntries(
        data.map((item, i) => [
          item[index],
          { 
            theme: { 
              light: `hsl(var(--${colors[i % colors.length]}))`,
              dark: `hsl(var(--${colors[i % colors.length]}))` 
            } 
          },
        ])
      )
    : {};

  if (!hasValidData) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ChartContainer config={config}>
      <RechartsPieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey={category}
          nameKey={index}
        >
          {data.map((entry, i) => (
            <Cell 
              key={`cell-${i}`} 
              fill={`var(--color-${entry[index]})`}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => (
            <ChartTooltipContent
              active={active}
              payload={payload}
              nameKey={index}
              labelKey={category}
              formatter={(value) => valueFormatter(Number(value))}
            />
          )}
        />
        <ChartLegend payload={data.map((item, i) => ({
          value: item[index],
          color: `var(--color-${item[index]})`,
          dataKey: item[index]
        }))} />
      </RechartsPieChart>
    </ChartContainer>
  );
}
