"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PiTrash } from "react-icons/pi";

type BulkPartner = {
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  bulkPartnerAccount: BulkPartner | null;
};

export default function ViewProfileModal({
  open,
  onClose,
  bulkPartnerAccount,
}: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    prevActive.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    document.body.classList.add("overflow-hidden");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
      prevActive.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  const password = "smith321564";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-partner-modal-title"
    >
      <div
        className="inline-block w-fit max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-6 shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="items-center">
          <h2
            id="bulk-partner-modal-title"
            className="text-[1.384rem] text-[#222222] font-semibold"
          >
            {bulkPartnerAccount?.name ?? "—"}
          </h2>
        </div>

        <div className="space-y-2 text-[0.983rem] text-[#667282]">
          <p>{bulkPartnerAccount?.email ?? "—"}</p>
          <p>
            <span className="font-medium text-black">Username:</span>{" "}
            {bulkPartnerAccount?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium text-black">Password:</span>{" "}
            {password ?? "—"}
          </p>
        </div>

        <div className=" flex justify-center pt-4">
          <button
            onClick={onClose}
            className="rounded-lg flex items-center gap-2 border border-[#CB0000] bg-white px-4 py-2 text-[#CB0000] font-medium hover:bg-gray-100"
          >
            {" "}
            <PiTrash className="text-[0.769rem]" />
            Delete User
          </button>
        </div>

        <div className=" pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-red-700 px-4 py-2 text-[0.968rem] text-white font-semibold hover:bg-red-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
