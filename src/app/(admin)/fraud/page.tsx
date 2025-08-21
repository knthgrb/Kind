"use client";

import React from "react";
import { formatMMDDYYYY } from "@/utils/dateFormatter";
import Pagination from "@/components/Pagination";
import { LuFilter, LuSearch } from "react-icons/lu";

export default function FraudActivity() {
  const fraudData = [
    {
      name: "Darlene Robertson",
      activityType: "Fake ID",
      joiningDate: "2016-9-23",
      time: "01:09 am",
      status: "Resolved",
    },
    {
      name: "Cody Fisher",
      activityType: "Spam Messaging",
      joiningDate: "2012-10-28",
      time: "10:41 pm",
      status: "Investigating",
    },
    {
      name: "Savannah Nguyen",
      activityType: "Fake ID",
      joiningDate: "2017-12-4",
      time: "05:49 pm",
      status: "Investigating",
    },
    {
      name: "Floyd Miles",
      activityType: "Spam Messaging",
      joiningDate: "2013-7-27",
      time: "07:13 pm",
      status: "Resolved",
    },
    {
      name: "Jacob Jones",
      activityType: "Fake ID",
      joiningDate: "2012-1-15",
      time: "01:55 pm",
      status: "Investigating",
    },
    {
      name: "Marvin McKinney",
      activityType: "Spam Messaging",
      joiningDate: "2016-3-4",
      time: "01:08 pm",
      status: "Resolved",
    },
    {
      name: "Cameron Williamson",
      activityType: "Fake ID",
      joiningDate: "2017-8-15",
      time: "02:34 am",
      status: "Resolved",
    },
    {
      name: "Courtney Henry",
      activityType: "Fake ID",
      joiningDate: "2016-5-7",
      time: "02:02 am",
      status: "Resolved",
    },

    // +16 more
    {
      name: "Ralph Edwards",
      activityType: "Spam Messaging",
      joiningDate: "2012-10-12",
      time: "11:22 am",
      status: "Investigating",
    },
    {
      name: "Theresa Webb",
      activityType: "Fake ID",
      joiningDate: "2015-4-17",
      time: "09:31 pm",
      status: "Resolved",
    },
    {
      name: "Devon Lane",
      activityType: "Spam Messaging",
      joiningDate: "2016-6-9",
      time: "03:45 am",
      status: "Resolved",
    },
    {
      name: "Kristin Watson",
      activityType: "Fake ID",
      joiningDate: "2018-1-23",
      time: "12:07 pm",
      status: "Investigating",
    },
    {
      name: "Dianne Russell",
      activityType: "Spam Messaging",
      joiningDate: "2013-3-2",
      time: "04:58 pm",
      status: "Resolved",
    },
    {
      name: "Jane Cooper",
      activityType: "Fake ID",
      joiningDate: "2017-7-5",
      time: "08:14 am",
      status: "Resolved",
    },
    {
      name: "Jerome Bell",
      activityType: "Spam Messaging",
      joiningDate: "2014-11-19",
      time: "10:03 pm",
      status: "Investigating",
    },
    {
      name: "Wade Warren",
      activityType: "Fake ID",
      joiningDate: "2011-2-28",
      time: "06:22 am",
      status: "Resolved",
    },
    {
      name: "Leslie Alexander",
      activityType: "Spam Messaging",
      joiningDate: "2019-9-8",
      time: "05:11 pm",
      status: "Investigating",
    },
    {
      name: "Jenny Wilson",
      activityType: "Fake ID",
      joiningDate: "2018-12-1",
      time: "07:40 am",
      status: "Resolved",
    },
    {
      name: "Robert Fox",
      activityType: "Spam Messaging",
      joiningDate: "2015-5-30",
      time: "01:27 pm",
      status: "Investigating",
    },
    {
      name: "Albert Flores",
      activityType: "Fake ID",
      joiningDate: "2016-8-21",
      time: "02:55 am",
      status: "Resolved",
    },
    {
      name: "Annette Black",
      activityType: "Spam Messaging",
      joiningDate: "2013-6-14",
      time: "09:16 am",
      status: "Resolved",
    },
    {
      name: "Bessie Cooper",
      activityType: "Fake ID",
      joiningDate: "2017-10-9",
      time: "04:02 pm",
      status: "Investigating",
    },
    {
      name: "Kathryn Murphy",
      activityType: "Spam Messaging",
      joiningDate: "2012-12-18",
      time: "11:50 am",
      status: "Resolved",
    },
    {
      name: "Guy Hawkins",
      activityType: "Fake ID",
      joiningDate: "2014-1-7",
      time: "08:59 pm",
      status: "Investigating",
    },
  ];

  const pageSize = 8;
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(fraudData.length / pageSize);
  const from = (page - 1) * pageSize;
  const rows = fraudData.slice(from, from + pageSize);

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
        <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[1.578rem] !font-medium">Fraud Activity</h1>

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

          {/* Table */}
          <div className="mt-6 overflow-x-auto">
            <div className="rounded-2xl border border-[#E8F1FD] overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 text-gray-500 text-sm">
                  <tr>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Number
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Name
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Activity Type
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Joining Date
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Time
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Status
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E8F1FD] text-[15px]">
                  {rows.map((r, i) => (
                    <tr key={`${r.name}-${from + i}`}>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-900 font-bold">
                        {String(from + i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {r.name}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {r.activityType}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {formatMMDDYYYY(r.joiningDate)}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {r.time}
                      </td>
                      <td
                        className={`px-6 py-4 text-[0.941rem] ${
                          r.status === "Resolved"
                            ? "text-[#22C03C]"
                            : "text-[#FF0004]"
                        }`}
                      >
                        {r.status}
                      </td>
                      <td className="px-6 py-4">
                        <button className="inline-block rounded-xl bg-red-700 px-4 py-2 text-white text-[0.64rem] font-semibold hover:bg-red-800">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => setPage(p)}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
}
