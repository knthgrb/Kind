"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import ContinueModal from "@/components/modals/ContinueModal";
import Dropdown from "@/components/dropdown/Dropdown";
import { FaTimes } from "react-icons/fa";
import PrimaryButton from "../buttons/PrimaryButton";
import SecondaryButton from "../buttons/SecondaryButton";

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded?: () => void;
};

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onEmployeeAdded,
}: AddEmployeeModalProps) {
  // form state
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    title?: string;
    description?: string;
    buttonLabel?: string;
    icon?: string | null;
    onAction?: () => void;
  }>({});

  const jobOptions = [
    "Cleaner",
    "Yaya",
    "Helper",
    "Caregivers",
    "Driver",
    "Security",
  ];

  const statusOptions = ["Active", "Inactive"];

  const handleAddEmployee = async () => {
    if (!name.trim() || !job.trim() || !joiningDate.trim()) {
      setModalProps({
        title: "Missing Information",
        description:
          "Please complete all required fields before adding the employee.",
        buttonLabel: "OK",
        icon: null,
        onAction: () => setModalOpen(false),
      });
      setModalOpen(true);
      return;
    }

    try {
      // For now, we'll just simulate adding an employee
      // In a real app, this would call an API to add the employee
      const newEmployee = {
        id: `emp-${Date.now()}`,
        name: name.trim(),
        job: job.trim(),
        joiningDate: joiningDate,
        totalHoursWork: "0 Hours",
        status: status,
      };

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setModalProps({
        title: "Employee Added",
        description: `${newEmployee.name} has been added to your team successfully`,
        buttonLabel: "Continue",
        icon: "/icons/checkCircleOTP.png",
        onAction: () => {
          setModalOpen(false);
          onClose();
          onEmployeeAdded?.();
        },
      });
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to add employee:", err);
      setModalProps({
        title: "Error",
        description: "Something went wrong while adding the employee.",
        buttonLabel: "OK",
        icon: null,
        onAction: () => setModalOpen(false),
      });
      setModalOpen(true);
    }
  };

  const handleClose = () => {
    // Reset form
    setName("");
    setJob("");
    setJoiningDate("");
    setStatus("Active");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#DFDFDF] shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Add Employee</h2>
            <button
              onClick={handleClose}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Employee Name */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Employee Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter employee name"
                className="w-full h-12 rounded-xl border border-[#DFDFDF] px-4 outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
              />
            </div>

            {/* Job Position */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Job Position
              </label>
              <Dropdown
                value={job}
                onChange={setJob}
                options={jobOptions}
                placeholder="Select job position"
                className="border border-[#DFDFDF] rounded-xl"
              />
            </div>

            {/* Joining Date */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Joining Date
              </label>
              <input
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                type="date"
                className="w-full h-12 rounded-xl border border-[#DFDFDF] px-4 outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="mb-8">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status
              </label>
              <Dropdown
                value={status}
                onChange={(val) => setStatus(val as "Active" | "Inactive")}
                options={statusOptions}
                placeholder="Select status"
                className="border border-[#DFDFDF] rounded-xl"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3">
              <SecondaryButton onClick={handleClose}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleAddEmployee}>
                Add Employee
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      <ContinueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAction={modalProps.onAction ?? (() => setModalOpen(false))}
        title={modalProps.title ?? ""}
        description={modalProps.description ?? ""}
        buttonLabel={modalProps.buttonLabel ?? "OK"}
        icon={modalProps.icon ?? undefined}
      />
    </>,
    document.body
  );
}
