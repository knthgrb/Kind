"use client";

import React from "react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { HiOutlinePencil } from "react-icons/hi2";
import { PiTrash } from "react-icons/pi";
import { FaUser } from "react-icons/fa";
import Pagination from "@/components/pagination/Pagination";
import Link from "next/link";

import { Payslip } from "@/lib/kindBossing/data";

interface PayslipClientProps {
  payslips: Payslip[];
}

export default function PayslipClient({ payslips }: PayslipClientProps) {
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(payslips.length / pageSize);
  const from = (page - 1) * pageSize;
  const rows = payslips.slice(from, from + pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-white border-b border-gray-200 text-gray-500 text-sm">
              <tr>
                {[
                  "Employee",
                  "Month",
                  "Total Net Pay",
                  "Hours Work",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-gray-500 text-sm font-medium px-6 py-4 text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {rows.map((payslip, i) => (
                <tr
                  key={`${payslip.name}-${from + i}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {payslip.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{payslip.month}</td>
                  <td className="px-6 py-4 text-gray-600">{payslip.netPay}</td>
                  <td className="px-6 py-4 text-gray-600">{payslip.hours}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        payslip.status
                      )}`}
                    >
                      {payslip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg bg-[#CC0000] text-white hover:bg-red-700 transition-colors">
                        <MdOutlineRemoveRedEye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-[#CC0000] text-white hover:bg-red-700 transition-colors">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-[#CC0000] text-white hover:bg-red-700 transition-colors">
                        <PiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="mt-6 space-y-4 lg:hidden">
        {rows.map((payslip, i) => (
          <div
            key={`${payslip.name}-${from + i}`}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {payslip.name}
                </div>
                <div className="text-sm text-gray-600">{payslip.month}</div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  payslip.status
                )}`}
              >
                {payslip.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Net Pay:</span>
                <span className="font-medium">{payslip.netPay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hours Work:</span>
                <span className="font-medium">{payslip.hours}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 flex justify-center p-2 rounded-lg bg-[#CC0000] text-white hover:bg-red-700 transition-colors">
                <MdOutlineRemoveRedEye className="w-4 h-4" />
              </button>
              <button className="flex-1 flex justify-center p-2 rounded-lg bg-[#CC0000] text-white hover:bg-red-700 transition-colors">
                <HiOutlinePencil className="w-4 h-4" />
              </button>
              <button className="flex-1 flex justify-center p-2 rounded-lg bg-[#CC0000] text-white hover:bg-red-700 transition-colors">
                <PiTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => setPage(p)}
        className="mt-6"
      />
    </div>
  );
}
