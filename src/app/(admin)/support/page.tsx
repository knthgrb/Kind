"use client";

import React from "react";
import { formatMMDDYYYY } from "@/utils/dateFormatter";
import Pagination from "@/components/Pagination";
import { LuFilter, LuSearch } from "react-icons/lu";
import SupportTicketDialog from "./_components/supportTicketModal";

export default function SupportTickets() {
  const ticketData = [
    {
      id: 123,
      userName: "Darlene Robertson",
      userType: "KindTao",
      issueType: "Profile Issue",
      submittedDate: "2016-09-23",
      status: "Resolved",
    },
    {
      id: 124,
      userName: "Cody Fisher",
      userType: "KindBossing",
      issueType: "Profile Issue",
      submittedDate: "2012-10-28",
      status: "In Progress",
    },
    {
      id: 125,
      userName: "Savannah Nguyen",
      userType: "KindTao",
      issueType: "Profile Issue",
      submittedDate: "2017-12-04",
      status: "In Progress",
    },
    {
      id: 126,
      userName: "Floyd Miles",
      userType: "KindTao",
      issueType: "Payment Issue",
      submittedDate: "2013-07-27",
      status: "Resolved",
    },
    {
      id: 127,
      userName: "Jacob Jones",
      userType: "KindBossing",
      issueType: "Payment Issue",
      submittedDate: "2012-01-15",
      status: "In Progress",
    },
    {
      id: 128,
      userName: "Marvin McKinney",
      userType: "KindBossing",
      issueType: "Fraud Report",
      submittedDate: "2016-03-04",
      status: "Resolved",
    },
    {
      id: 129,
      userName: "Cameron Williamson",
      userType: "KindBossing",
      issueType: "Payment Issue",
      submittedDate: "2017-08-15",
      status: "Resolved",
    },
    {
      id: 130,
      userName: "Courtney Henry",
      userType: "KindTao",
      issueType: "Fraud Report",
      submittedDate: "2016-05-07",
      status: "Resolved",
    },
    {
      id: 131,
      userName: "Esther Howard",
      userType: "KindTao",
      issueType: "Profile Issue",
      submittedDate: "2018-06-12",
      status: "In Progress",
    },
    {
      id: 132,
      userName: "Theresa Webb",
      userType: "KindBossing",
      issueType: "Payment Issue",
      submittedDate: "2015-02-27",
      status: "Resolved",
    },
    {
      id: 133,
      userName: "Ralph Edwards",
      userType: "KindTao",
      issueType: "Fraud Report",
      submittedDate: "2013-09-18",
      status: "Resolved",
    },
    {
      id: 134,
      userName: "Devon Lane",
      userType: "KindBossing",
      issueType: "Profile Issue",
      submittedDate: "2014-04-05",
      status: "In Progress",
    },
    {
      id: 135,
      userName: "Kristin Watson",
      userType: "KindBossing",
      issueType: "Payment Issue",
      submittedDate: "2019-01-23",
      status: "In Progress",
    },
    {
      id: 136,
      userName: "Dianne Russell",
      userType: "KindTao",
      issueType: "Fraud Report",
      submittedDate: "2013-03-02",
      status: "Resolved",
    },
    {
      id: 137,
      userName: "Jane Cooper",
      userType: "KindTao",
      issueType: "Profile Issue",
      submittedDate: "2017-07-05",
      status: "Resolved",
    },
  ];

  const pageSize = 8;
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(ticketData.length / pageSize);
  const from = (page - 1) * pageSize;
  const rows = ticketData.slice(from, from + pageSize);

  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<
    (typeof ticketData)[number] | null
  >(null);

  const handleOpen = (row: (typeof ticketData)[number]) => {
    setSelected(row);
    setOpen(true);
  };

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
        <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[1.578rem] !font-medium">Support Tickets</h1>

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
                      Ticket ID
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      User Name
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      User Type
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Issue Type
                    </th>
                    <th className="text-gray-500 text-[0.806rem] font-medium px-6 py-3 text-left">
                      Submitted Date
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
                    <tr key={`${r.id}-${from + i}`}>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-900 font-semibold">
                        #{r.id}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {r.userName}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {r.userType}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {r.issueType}
                      </td>
                      <td className="px-6 py-4 text-[0.941rem] text-gray-600">
                        {formatMMDDYYYY(r.submittedDate)}
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
                        <button
                          onClick={() => handleOpen(r)}
                          className="inline-block rounded-xl bg-red-700 px-4 py-2 text-white text-[0.64rem] font-semibold hover:bg-red-800"
                        >
                          View Details
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
      <SupportTicketDialog
        open={open}
        onClose={() => setOpen(false)}
        ticket={selected}
      />
    </div>
  );
}
