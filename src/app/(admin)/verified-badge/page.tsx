import React from "react";
import { LuFilter, LuSearch } from "react-icons/lu";

export default function VerifiedBadge() {
  const verifiedBadgeData = [
    {
      id: 5461,
      name: "Darlene Robertson",
      email: "abc@gmail.com",
      status: "Pending",
    },
  ];

  return (
    <div className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-7xl border border-[#D9E0E8] rounded-3xl p-8 bg-white">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[1.578rem] !font-medium">Verified Badge</h1>

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
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E8F1FD] text-[15px]">
                {verifiedBadgeData.map((r, i) => (
                  <tr key={`${r.id}-${i}`}>
                    <td className="px-6 py-4 text-[0.941rem] text-gray-900 font-medium">
                      #{r.id}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
