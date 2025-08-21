"use client";

import React from "react";
import StatCard from "../_components/StatCard";
import UsageGrowthChart from "./_components/UsageGrowthChart";

const platformUsagePipelineData = {
  stats: {
    totalActiveUsers: 5250,
    newSignups: 232,
    totalJobsPosted: 530,
    registeredUsers: 2594,
    verifiedUsers: 1925,
    jobsCreated: 2515,
    jobsCompleted: 2450,
  },
};

const expectedUsage = 30;
const usageGrowthData = [
  { period: "P1", usage: 45, trend: 45 },
  { period: "P2", usage: 62, trend: 62 },
  { period: "P3", usage: 41, trend: 41 },
  { period: "P4", usage: 28, trend: 28 },
  { period: "P5", usage: 48, trend: 48 },
  { period: "P6", usage: 73, trend: 73 },
  { period: "P7", usage: 29, trend: 29 },
  { period: "P8", usage: 52, trend: 52 },
  { period: "P9", usage: 35, trend: 35 },
  { period: "P10", usage: 58, trend: 58 },
  { period: "P11", usage: 25, trend: 25 },
];

export default function PlatformUsagePipeline() {
  const { stats } = platformUsagePipelineData;

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-4 grid-cols-1 lg:grid-cols-3 pb-6">
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard
              label="Total Active Users"
              value={stats.totalActiveUsers}
            />
          </div>
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard label="New Signups This Month" value={stats.newSignups} />
          </div>
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard label="Total Jobs Posted" value={stats.totalJobsPosted} />
          </div>
        </div>

        <div className="rounded-xl border border-[#D0D0D0] bg-white p-5 bg-white">
          <h3 className="text-[1.034rem] text-[#3D434A] font-semibold pb-6">
            Usage Growth
          </h3>
          <UsageGrowthChart
            data={usageGrowthData}
            expectedUsage={expectedUsage}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-6">
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard label="Registered Users" value={stats.registeredUsers} />
          </div>
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard label="Verified Users" value={stats.verifiedUsers} />
          </div>
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard label="Jobs Created" value={stats.jobsCreated} />
          </div>
          <div className="rounded-xl border border-[#D0D0D0] bg-white">
            <StatCard label="Jobs Completed" value={stats.jobsCompleted} />
          </div>
        </div>
      </div>
    </div>
  );
}
