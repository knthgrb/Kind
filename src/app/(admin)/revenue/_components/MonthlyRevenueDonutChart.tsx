"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface BreakdownData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: BreakdownData[];
}

export default function RevenueBreakdownChart({ data }: Props) {
  return (
    <div className="relative flex-1 aspect-square max-h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[1.463rem] font-bold text-[#373D3F]">
            Revenue
          </div>
        </div>
      </div>
    </div>
  );
}
