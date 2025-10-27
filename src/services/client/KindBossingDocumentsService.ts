import { createClient } from "@/utils/supabase/client";

export interface KindBossingDocument {
  id: string;
  created_at: string;
  kindbossing_user_id: string;
  file_url: string;
  title: string;
  size: number;
  content_type: string | null;
}

export interface UploadDocumentData {
  title: string;
  type: string;
  description?: string;
  file: File;
}

export class KindBossingDocumentsService {
  /**
   * Upload a document to Supabase storage
   */
  static async uploadDocument(
    documentData: UploadDocumentData
  ): Promise<{ data: KindBossingDocument | null; error: Error | null }> {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    try {
      // Generate a unique file path
      const fileExt = documentData.file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${user.user.id}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("kindbossing-documents")
        .upload(filePath, documentData.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ File upload failed:", uploadError);
        return { data: null, error: uploadError };
      }

      // Get public URL for the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("kindbossing-documents").getPublicUrl(filePath);

      // Save document metadata to database
      const { data, error } = await supabase
        .from("kindbossing_documents")
        .insert({
          kindbossing_user_id: user.user.id,
          file_url: publicUrl,
          title: documentData.title,
          size: documentData.file.size,
          content_type: documentData.file.type,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Document metadata save failed:", error);
        // Try to cleanup the uploaded file
        await supabase.storage.from("kindbossing-documents").remove([filePath]);
        return { data: null, error };
      }

      console.log("✅ Document uploaded successfully:", data);
      return { data, error: null };
    } catch (error) {
      console.error("❌ Unexpected error uploading document:", error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Fetch all documents for the current user
   */
  static async getDocuments(): Promise<{
    data: KindBossingDocument[] | null;
    error: Error | null;
  }> {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    try {
      const { data, error } = await supabase
        .from("kindbossing_documents")
        .select("*")
        .eq("kindbossing_user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching documents:", error);
        return { data: null, error };
      }

      console.log("✅ Documents fetched successfully:", data);
      return { data, error: null };
    } catch (error) {
      console.error("❌ Unexpected error fetching documents:", error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(
    documentId: string
  ): Promise<{ success: boolean; error: Error | null }> {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: new Error("User not authenticated") };
    }

    try {
      // Get document details
      const { data: document, error: fetchError } = await supabase
        .from("kindbossing_documents")
        .select("*")
        .eq("id", documentId)
        .eq("kindbossing_user_id", user.user.id)
        .single();

      if (fetchError || !document) {
        return {
          success: false,
          error: new Error("Document not found"),
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
        console.error(
          "❌ Error deleting file from storage:",
          deleteStorageError
        );
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("kindbossing_documents")
        .delete()
        .eq("id", documentId);

      if (deleteError) {
        console.error("❌ Error deleting document from database:", deleteError);
        return { success: false, error: deleteError };
      }

      console.log("✅ Document deleted successfully");
      return { success: true, error: null };
    } catch (error) {
      console.error("❌ Unexpected error deleting document:", error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Download document as a blob URL
   */
  static async downloadDocument(
    documentId: string
  ): Promise<{ data: Blob | null; error: Error | null }> {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    try {
      // Get document details
      const { data: document, error: fetchError } = await supabase
        .from("kindbossing_documents")
        .select("*")
        .eq("id", documentId)
        .eq("kindbossing_user_id", user.user.id)
        .single();

      if (fetchError || !document) {
        return {
          data: null,
          error: new Error("Document not found"),
        };
      }

      // Download file from storage
      const urlParts = document.file_url.split("/");
      const filePath = urlParts
        .slice(urlParts.indexOf("kindbossing-documents") + 1)
        .join("/");

      const { data: fileData, error: downloadError } = await supabase.storage
        .from("kindbossing-documents")
        .download(filePath);

      if (downloadError) {
        console.error("❌ Error downloading file:", downloadError);
        return { data: null, error: downloadError };
      }

      console.log("✅ Document downloaded successfully");
      return { data: fileData, error: null };
    } catch (error) {
      console.error("❌ Unexpected error downloading document:", error);
      return { data: null, error: error as Error };
    }
  }
}
