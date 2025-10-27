"use client";
import Link from "next/link";
import React, { useState } from "react";
import { FiCheck, FiCheckCircle, FiClock, FiFilter } from "react-icons/fi";
import FilterModal, { Filters } from "./FilterModal";

type MenuPanelProps = {
  locations: string[];
  jobTypes: string[];
  payTypes: string[];
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
};

export default function MenuPanel({
  locations,
  jobTypes,
  payTypes,
  onFilterChange,
  initialFilters,
}: MenuPanelProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <aside className="col-span-4 lg:col-span-3">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <nav className="space-y-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex cursor-pointer w-full gap-4 items-center px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            <span className="font-medium text-gray-900">Filters</span>
          </button>
          <Link
            href="/kindtao/my-jobs"
            className="flex items-center gap-4 px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiClock className="w-4 h-4" />
            <span className="font-medium text-gray-900">Active</span>
          </Link>
          <Link
            href="/kindtao/my-jobs"
            className="flex items-center gap-4 px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span className="font-medium text-gray-900">Applied</span>
          </Link>
          <Link
            href="/kindtao/my-jobs"
            className="flex items-center gap-4 px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiCheck className="w-4 h-4" />
            <span className="font-medium text-gray-900">Completed</span>
          </Link>
        </nav>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={onFilterChange}
        locations={locations}
        jobTypes={jobTypes}
        payTypes={payTypes}
        initialFilters={initialFilters}
      />
    </aside>
  );
}
