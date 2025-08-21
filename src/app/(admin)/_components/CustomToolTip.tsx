"use client";

import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

export default function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#CB0000] text-[#fff] font-bold p-3 border rounded-lg shadow-lg">
        {payload.map((entry, index) => (
          <p key={index}>₱{entry.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
}
