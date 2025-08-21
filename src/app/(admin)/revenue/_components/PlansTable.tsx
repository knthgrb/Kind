"use client";

import React from "react";
import { LuFilter, LuSearch } from "react-icons/lu";

interface Plan {
  id: number;
  planName: string;
  activeUsers: number;
  planType: string;
  amountCollected: number;
}

interface Props {
  plans: Plan[];
}

export default function PlansTable({ plans }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[1.578rem] !font-medium">Plans </h1>

        <div className="flex items-center gap-11">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-400 px-3.5 py-2 text-[0.886rem] text-gray-500 hover:bg-gray-50"
          >
            <LuFilter className="text-base" />
            <span>Filter</span>
          </button>

          <label className="relative block">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search........."
              className="w-52 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-[0.9rem] text-gray-100 placeholder-gray-400 focus:outline-none"
            />
          </label>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E8F1FD] overflow-hidden mt-6">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="px-6 py-3 text-left text-[0.806rem] font-medium">
                Number
              </th>
              <th className="px-6 py-3 text-left text-[0.806rem] font-medium">
                Plan Name
              </th>
              <th className="px-6 py-3 text-left text-[0.806rem] font-medium">
                Active Users
              </th>
              <th className="px-6 py-3 text-left text-[0.806rem] font-medium">
                Plan Type
              </th>
              <th className="px-6 py-3 text-left text-[0.806rem] font-medium">
                Amount Collected
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8F1FD] text-[15px]">
            {plans.map((r, i) => (
              <tr key={`${r.id}-${i}`}>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {String(r.id).padStart(2, "0")}
                </td>
                <td className="px-6 py-4 text-gray-600">{r.planName}</td>
                <td className="px-6 py-4 text-gray-600">{r.activeUsers}</td>
                <td className="px-6 py-4 text-gray-600">{r.planType}</td>
                <td className="px-6 py-4 text-gray-600">{r.amountCollected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
