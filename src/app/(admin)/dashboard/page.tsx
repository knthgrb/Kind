"use client";

import React from "react";
import StatCard from "../_components/StatCard";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { GoTriangleUp } from "react-icons/go";
import Link from "next/link";
import MonthlyRevenueLineChart from "../_components/MonthlyRevenueLineChart";
import EmployeeEngagementBarChart from "./_components/EmployeeEngagementBarChart";

const monthlyRevenueData = [
  { month: "SEP", value: 98, trend: 76 },
  { month: "OCT", value: 88, trend: 65 },
  { month: "NOV", value: 108, trend: 90 },
  { month: "DEC", value: 80, trend: 65 },
  { month: "JAN", value: 120, trend: 95 },
  { month: "FEB", value: 118, trend: 100 },
];

const employeeEngagementData = [
  { period: "P1", value: 55, trend: 0 },
  { period: "P2", value: 68, trend: 0 },
  { period: "P3", value: 43, trend: 30 },
  { period: "P4", value: 50, trend: 0 },
  { period: "P5", value: 85, trend: 0 },
  { period: "P6", value: 0, trend: 32 },
  { period: "P7", value: 50, trend: 0 },
  { period: "P8", value: 33, trend: 0 },
  { period: "P9", value: 58, trend: 0 },
  { period: "P10", value: 0, trend: 18 },
];

const dashboardData = {
  stats: {
    totalUsers: 225,
    totalRevenue: 55250,
    pendingVerifications: 20,
    openTickets: 15,
  },
};

export default function Dashboard() {
  const { stats } = dashboardData;

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/platform-usage-pipeline">
            <div className="rounded-xl border border-[#D0D0D0] bg-white">
              <StatCard label="Total Users" value={stats.totalUsers} />
            </div>
          </Link>
          <Link href="/revenue">
            <div className="rounded-xl border border-[#D0D0D0] bg-white">
              <StatCard
                label="Total Revenue"
                value={`₱${stats.totalRevenue}`}
              />
            </div>
          </Link>
          <Link href="/verified-badge">
            <div className="rounded-xl border border-[#D0D0D0] bg-white">
              <StatCard
                label="Pending Verifications"
                value={stats.pendingVerifications}
              />
            </div>
          </Link>
          <Link href="/support">
            <div className="rounded-xl border border-[#D0D0D0] bg-white">
              <StatCard
                label="Open Support Tickets"
                value={stats.openTickets}
              />{" "}
            </div>
          </Link>
        </div>

        <div className="pt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Monthly Revenue */}
          <div className="rounded-xl border border-[#D0D0D0] bg-white p-5 ">
            <h3 className="font-semibold text-[#3D434A] pb-4">
              Monthly Revenue
            </h3>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[2.145rem] text-[#CB0000] font-bold">
                  ₱37.5K
                </div>
                <div className="flex items-center gap-1 text-[#A3AED0] text-sm">
                  Total Spent
                  <GoTriangleUp className="text-[#CB0000]" />
                  <span className="text-[#CB0000] font-bold">+2.45%</span>
                </div>
                <div className="flex items-center gap-2 pt-3">
                  <IoIosCheckmarkCircle className="text-xl text-[#CB0000]" />
                  <span className="text-[#CB0000] font-bold">On track</span>
                </div>
              </div>
              <div className="flex-1 h-[300px]">
                <MonthlyRevenueLineChart data={monthlyRevenueData} />
              </div>
            </div>
          </div>

          {/* Employee Engagement */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 bg-white shadow-sm border border-gray-200">
            <h3 className="text-[1.034rem] text-[#3D434A] font-semibold pb-4">
              Employee Engagement
            </h3>
            <EmployeeEngagementBarChart data={employeeEngagementData} />
          </div>
        </div>
      </div>
    </div>
  );
}
