"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatMMDDYYYY } from "@/utils/dateFormatter";

type Ticket = {
  id: number;
  userName: string;
  userType: string;
  issueType: string;
  submittedDate: string;
  status: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
};

export default function SupportTicketDialog({ open, onClose, ticket }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevActive = useRef<HTMLElement | null>(null);
  const [status, setStatus] = React.useState<Ticket["status"]>("In Progress");

  useEffect(() => {
    if (ticket) setStatus(ticket.status);
  }, [ticket]);

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

  const profilePic = "/people/user-profile.png";
  const email = "example@gmail.com";
  const number = "+6345 845 6456";
  const address = "Street 123 Philippines  ";
  const issueDesc =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.";
  const attachments = [
    "/profile/id_placeholder_one.png",
    "/profile/id_placeholder_two.png",
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-dialog-title"
    >
      <div
        className="w-full max-w-5xl rounded-[28px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left: User Information */}
          <section className="rounded-2xl bg-gray-50 p-5">
            <h3 className="mb-4 text-[1.314rem] font-semibold text-[#222222]">
              User Information
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative w-40 aspect-square rounded-full overflow-hidden bg-white ring-4 ring-[#D0D0D0]">
                <img src={profilePic} alt="" className="object-cover" />
              </div>
              <div>
                <div className="text-[1.417rem] font-semibold text-[#222222]">
                  {ticket?.userName ?? "—"}
                </div>
                <div className="text-[1.006rem] text-[#667282]">{email}</div>
                <div className="text-[1.006rem] text-[#667282]">{number}</div>
                <div className="text-[1.006rem] text-[#667282]">{address}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-[1.006rem]">
              <div>
                <div className="text-[1.006rem] font-medium text-[#101010]">
                  Ticket ID:
                </div>
                <div className="text-[1.006rem] text-[#667282]">
                  #{ticket ? String(ticket.id).padStart(3, "0") : "—"}
                </div>
              </div>
              <div>
                <div className="text-[1.006rem] font-medium text-[#101010]">
                  Submitted Date:
                </div>
                <div className="text-[1.006rem] text-[#667282]">
                  {ticket ? formatMMDDYYYY(ticket.submittedDate) : "—"}
                </div>
              </div>
              <div>
                <div className="text-[1.006rem] font-medium text-[#101010]">
                  Ticket Status:
                </div>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-[1.006rem] text-[#667282]"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as Ticket["status"])
                  }
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </section>

          {/* Right: Issue */}
          <section className="rounded-2xl bg-gray-50 p-5">
            <h3 className="mb-3 text-[1.417rem] font-semibold text-[#222222]">
              {ticket?.issueType ?? "Issue"}
            </h3>
            <div className="text-[1.006rem] text-[#667282]">{issueDesc}</div>

            <div className="mt-4 text-sm font-medium text-gray-700">
              Attached File
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {attachments.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`attachment-${i}`}
                  className="h-20 w-36 rounded-md object-cover ring-1 ring-gray-200"
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer buttons */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-red-600 px-6 py-2 text-[0.95rem] font-semibold text-red-600 hover:bg-red-50"
          >
            Back
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="rounded-xl bg-red-700 px-6 py-2 text-[0.95rem] font-semibold text-white hover:bg-red-800"
          >
            Close Ticket
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
