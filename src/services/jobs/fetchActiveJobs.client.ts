"use client";

import { createClient } from "@/utils/supabase/client";
import { JobPost, SalaryRate } from "@/types/jobPosts";

export type ActiveJobClientFilters = {
  location?: string;
  jobType?: string;
  payType?: SalaryRate | "All";
  keyword?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
};

export async function fetchActiveJobsClient(
  filters?: ActiveJobClientFilters
): Promise<JobPost[]> {
  const supabase = createClient();

  let query = supabase
    .from("job_posts")
    .select(
      "id, family_id, title, description, job_type, location, salary_min, salary_max, salary_rate, created_at, updated_at"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters?.location && filters.location !== "All") {
    query = query.eq("location", filters.location);
  }
  if (filters?.jobType && filters.jobType !== "All") {
    query = query.eq("job_type", filters.jobType);
  }
  if (filters?.payType && filters.payType !== ("All" as any)) {
    query = query.eq("salary_rate", filters.payType as SalaryRate);
  }

  const keywordInput = (
    (filters?.keyword ?? "").trim() || (filters?.tags ?? []).join(" ")
  ).trim();
  if (keywordInput.length > 0) {
    const kw = keywordInput.replace(/%/g, "");
    query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
  }

  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 24;
  const offset = filters?.offset && filters.offset > 0 ? filters.offset : 0;
  const from = offset;
  const to = offset + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching active jobs (client):", error);
    return [];
  }
  return data ?? [];
}
