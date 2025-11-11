"use server";

import { createClient } from "@/utils/supabase/server";

export async function removeEmployee(
  employeeId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Verify the employee belongs to the user
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, kindbossing_user_id, status")
      .eq("id", employeeId)
      .single();

    if (employeeError || !employee) {
      return {
        success: false,
        error: "Employee not found",
      };
    }

    if (employee.kindbossing_user_id !== user.id) {
      return {
        success: false,
        error: "Unauthorized to remove this employee",
      };
    }

    // Check if already inactive
    if (employee.status === "inactive") {
      return {
        success: false,
        error: "Employee is already inactive",
      };
    }

    // Update employee status to inactive
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId);

    if (updateError) {
      console.error("Error removing employee:", updateError);
      return {
        success: false,
        error: "Failed to remove employee",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in removeEmployee:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

