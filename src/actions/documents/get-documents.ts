"use server";

import { createClient } from "@/utils/supabase/server";

export interface Document {
  id: string;
  created_at: string;
  kindbossing_user_id: string;
  file_url: string;
  title: string;
  size: number;
  content_type: string | null;
}

export async function getDocuments(): Promise<{
  success: boolean;
  data: Document[] | null;
  error: string | null;
}> {
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

    // Fetch documents
    const { data, error } = await supabase
      .from("kindbossing_documents")
      .select("*")
      .eq("kindbossing_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching documents:", error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    console.log("✅ Documents fetched successfully:", data);
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error("❌ Unexpected error fetching documents:", error);
    return {
      success: false,
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}
