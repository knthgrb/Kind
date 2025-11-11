"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToastActions } from "@/stores/useToastStore";
import { VerificationRequestService } from "@/services/client/VerificationRequestService";
import {
  IoCloudUploadOutline,
  IoCloseOutline,
  IoDocumentOutline,
} from "react-icons/io5";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: () => void;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onDocumentUploaded,
}: UploadDocumentModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const { showSuccess, showError } = useToastActions();

  const documentTypes = [
    {
      value: "id_card",
      label: "Valid ID",
      description: "Government-issued ID",
    },
    {
      value: "barangay_clearance",
      label: "Barangay Clearance",
      description: "Barangay clearance certificate",
    },
    {
      value: "clinic_certificate",
      label: "Medical Certificate",
      description: "Health certificate from clinic",
    },
    {
      value: "nbi_clearance",
      label: "NBI Clearance",
      description: "National Bureau of Investigation clearance",
    },
    {
      value: "police_clearance",
      label: "Police Clearance",
      description: "Police clearance certificate",
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      showError("Please select a file and document type");
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${documentType}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("verification-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("verification-documents")
        .getPublicUrl(filePath);

      // Save document metadata to database
      await VerificationRequestService.saveDocumentMetadata({
        title: selectedFile.name,
        file_url: urlData.publicUrl,
        size: selectedFile.size,
        content_type: selectedFile.type,
        document_type: documentType,
      });

      showSuccess("Document uploaded successfully and saved to your verification folder.");

      // Reset form
      setSelectedFile(null);
      setDocumentType("");

      // Close modal and refresh documents
      onClose();
      onDocumentUploaded();
    } catch (error) {
      console.error("Error uploading document:", error);
      showError("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setDocumentType("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Document
            </h3>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <IoCloseOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isUploading}
              >
                <option value="">Select document type</option>
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="document-upload-modal"
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={isUploading}
                />
                <label
                  htmlFor="document-upload-modal"
                  className={`flex flex-col items-center justify-center cursor-pointer ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <IoCloudUploadOutline className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {selectedFile
                      ? selectedFile.name
                      : "Click to upload document"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (max 10MB)
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="flex-1 cursor-pointer px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !documentType || isUploading}
                className="flex-1 cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
