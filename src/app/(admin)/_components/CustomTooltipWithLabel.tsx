"use client";

import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function CustomTooltip({
  active,
  payload,
  label,
}: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#CB0000] text-[#fff] font-bold p-3 border rounded-lg shadow-lg">
        <p>{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>
            {entry.name?.toLocaleString()}: {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
