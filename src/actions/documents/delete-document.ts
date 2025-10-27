"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean; error: string | null }> {
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
        error: "Not authenticated. Please sign in and try again.",
      };
    }

    // Get document details to verify ownership and get file path
    const { data: document, error: fetchError } = await supabase
      .from("kindbossing_documents")
      .select("*")
      .eq("id", documentId)
      .eq("kindbossing_user_id", user.id)
      .single();

    if (fetchError || !document) {
      return {
        success: false,
        error: "Document not found or you don't have permission to delete it.",
      };
    }

    // Extract file path from URL
    const urlParts = document.file_url.split("/");
    const filePath = urlParts
      .slice(urlParts.indexOf("kindbossing-documents") + 1)
      .join("/");

    // Delete file from storage
    const { error: deleteStorageError } = await supabase.storage
      .from("kindbossing-documents")
      .remove([filePath]);

    if (deleteStorageError) {
      console.error("❌ Error deleting file from storage:", deleteStorageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("kindbossing_documents")
      .delete()
      .eq("id", documentId)
      .eq("kindbossing_user_id", user.id);

    if (deleteError) {
      console.error("❌ Error deleting document from database:", deleteError);
      return {
        success: false,
        error: deleteError.message,
      };
    }

    revalidatePath("/documents");
    console.log("✅ Document deleted successfully");
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("❌ Unexpected error deleting document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}
