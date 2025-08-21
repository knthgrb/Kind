"use client";

import React from "react";
import { formatMMDDYYYY } from "@/utils/dateFormatter";
import Pagination from "@/components/Pagination";
import { LuFilter, LuSearch } from "react-icons/lu";
import ViewProfileModal from "./_components/viewProfileModal";
import RecreateModal from "./_components/recreateModal";

export default function BulkPartnerAccount() {
  const bulkPartnerAccountData = [
    { name: "Darlene Robertson", email: "abc@gmail.com", status: "Created" },
    { name: "Cody Fisher", email: "abc@gmail.com", status: "Failed" },
    { name: "Savannah Nguyen", email: "abc@gmail.com", status: "Failed" },
    { name: "Floyd Miles", email: "abc@gmail.com", status: "Created" },
    { name: "Jacob Jones", email: "abc@gmail.com", status: "Failed" },
    { name: "Marvin McKinney", email: "abc@gmail.com", status: "Created" },
    { name: "Cameron Williamson", email: "abc@gmail.com", status: "Created" },
    { name: "Courtney Henry", email: "abc@gmail.com", status: "Created" },
    { name: "Ralph Edwards", email: "abc@gmail.com", status: "Failed" },
    { name: "Kristin Watson", email: "abc@gmail.com", status: "Created" },
    { name: "Dianne Russell", email: "abc@gmail.com", status: "Created" },
    { name: "Jane Cooper", email: "abc@gmail.com", status: "Failed" },
    { name: "Devon Lane", email: "abc@gmail.com", status: "Created" },
    { name: "Esther Howard", email: "abc@gmail.com", status: "Failed" },
    { name: "Theresa Webb", email: "abc@gmail.com", status: "Created" },
    { name: "Jerome Bell", email: "abc@gmail.com", status: "Failed" },
    { name: "Wade Warren", email: "abc@gmail.com", status: "Created" },
    { name: "Leslie Alexander", email: "abc@gmail.com", status: "Created" },
    { name: "Jenny Wilson", email: "abc@gmail.com", status: "Failed" },
    { name: "Robert Fox", email: "abc@gmail.com", status: "Created" },
    { name: "Albert Flores", email: "abc@gmail.com", status: "Failed" },
    { name: "Annette Black", email: "abc@gmail.com", status: "Created" },
    { name: "Bessie Cooper", email: "abc@gmail.com", status: "Created" },
    { name: "Kathryn Murphy", email: "abc@gmail.com", status: "Failed" },
  ];

  const pageSize = 8;
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(bulkPartnerAccountData.length / pageSize);
  const from = (page - 1) * pageSize;
  const rows = bulkPartnerAccountData.slice(from, from + pageSize);

  const [openViewProfile, setOpenViewProfile] = React.useState(false);
  const [openRecreate, setOpenRecreate] = React.useState(false);
  const [selected, setSelected] = React.useState<
    (typeof bulkPartnerAccountData)[number] | null
  >(null);

  const handleOpen = (row: (typeof bulkPartnerAccountData)[number]) => {
    setSelected(row);
    if (row.status === "Created") {
      setOpenViewProfile(true);
    } else {
      setOpenRecreate(true);
    }
  };

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
        <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-[1.578rem] !font-medium">
              Bulk Partner Accounts
            </h1>

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

              <button className=" flex items-center px-6 py-2 bg-[#CC0000] hover:bg-red-800 text-[0.9rem] text-white rounded-lg w-fit">
                + Create Accounts
              </button>
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
                      Email
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
                        {r.email}
                      </td>
                      <td
                        className={`px-6 py-4 text-[0.941rem] ${
                          r.status === "Created"
                            ? "text-[#22C03C]"
                            : "text-[#FF0004]"
                        }`}
                      >
                        {r.status}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpen(r)}
                          className="inline-flex items-center justify-center w-28 rounded-xl bg-red-700 px-4 py-2 text-white text-[0.64rem] font-semibold hover:bg-red-800"
                        >
                          {r.status === "Created" ? "View Profile" : "Recreate"}
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

      <ViewProfileModal
        open={openViewProfile}
        onClose={() => setOpenViewProfile(false)}
        bulkPartnerAccount={selected}
      />

      <RecreateModal
        open={openRecreate}
        onClose={() => setOpenRecreate(false)}
      />
    </div>
  );
}
