"use client";

import React from "react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import CustomTooltip from "../_components/CustomToolTip";

interface LineChartProps {
  data: { month: string; value: number; trend: number }[];
}

export default function MonthlyRevenueLineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="#CB0000"
          strokeWidth={2}
          dot={false}
          activeDot={{
            fill: "white",
            stroke: "#CB0000",
            strokeWidth: 2,
            r: 4,
          }}
        />
        <Line
          type="monotone"
          dataKey="trend"
          stroke="#FFB3B3"
          strokeWidth={2}
          dot={false}
          activeDot={{
            fill: "white",
            stroke: "#FFB3B3",
            strokeWidth: 2,
            r: 4,
          }}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#A3AED0" }}
          padding={{ left: 20, right: 20 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </LineChart>
    </ResponsiveContainer>
  );
}
