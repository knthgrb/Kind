import { createClient } from "@/utils/supabase/server";
import { JobPost, SalaryRate } from "@/types/jobPosts";

type LatestJobFilters = {
  location?: string;
  jobType?: string;
  payType?: SalaryRate | "All";
  keyword?: string;
  tags?: string[];
  limit?: number;
};

export async function fetchLatestJobs(
  filters?: LatestJobFilters
): Promise<JobPost[]> {
  const supabase = await createClient();

  let query = supabase
    .from("active_job_posts")
    .select(
      "id, family_id, title, description, job_type, location, salary_min, salary_max, salary_rate, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(filters?.limit ?? 8);

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

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching latest jobs:", error);
    return [];
  }

  return data;
}
