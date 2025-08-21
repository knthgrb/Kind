"use client";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = "",
}: Props) {
  const pages = React.useMemo<(number | "...")[]>(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pool = new Set<number>([
      1,
      2,
      totalPages - 1,
      totalPages,
      page - 1,
      page,
      page + 1,
    ]);
    const sorted = [...pool]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
    const out: (number | "...")[] = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) out.push("...");
      out.push(n);
    });
    return out;
  }, [page, totalPages]);

  const clamp = (p: number) => Math.min(Math.max(1, p), totalPages);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Previous */}
      <button
        onClick={() => onChange(clamp(page - 1))}
        disabled={page === 1}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-400 px-3.5 py-2 text-[0.916rem] text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        <FaChevronLeft className="text-xs" aria-hidden />
        Previous
      </button>

      {/* Numbers */}
      <div className="flex items-center gap-6">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`text-[0.916rem] font-semibold rounded-md px-2 py-1 transition
                ${
                  p === page
                    ? "text-[#CB0000] bg-[#fefafa]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onChange(clamp(page + 1))}
        disabled={page === totalPages}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-400 px-3.5 py-2 text-[0.916rem] text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        Next
        <FaChevronRight className="text-xs" aria-hidden />
      </button>
    </div>
  );
}
