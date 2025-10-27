"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadDocument(
  formData: FormData
): Promise<{ success: boolean; data: any | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        data: null,
        error: "Not authenticated. Please sign in and try again.",
      };
    }

    // Extract form data
    const title = formData.get("title") as string;
    const type = formData.get("type") as string;
    const file = formData.get("file") as File;

    // Validate inputs
    if (!title || !type || !file) {
      return {
        success: false,
        data: null,
        error: "Please provide document name, type, and select a file.",
      };
    }

    // Validate file
    if (file.size === 0) {
      return {
        success: false,
        data: null,
        error: "Please select a file to upload.",
      };
    }

    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        data: null,
        error: "File size exceeds 10MB limit.",
      };
    }

    // Generate unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kindbossing-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ File upload failed:", uploadError);
      return {
        success: false,
        data: null,
        error: uploadError.message,
      };
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("kindbossing-documents").getPublicUrl(filePath);

    // Save document metadata to database
    const { data, error } = await supabase
      .from("kindbossing_documents")
      .insert({
        kindbossing_user_id: user.id,
        file_url: publicUrl,
        title: title,
        size: file.size,
        content_type: file.type,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Document metadata save failed:", error);
      // Try to cleanup the uploaded file
      await supabase.storage.from("kindbossing-documents").remove([filePath]);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    revalidatePath("/documents");
    console.log("✅ Document uploaded successfully:", data);
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error("❌ Unexpected error uploading document:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}
