import { createClient } from "@/utils/supabase/server";
import { JobPost, SalaryRate } from "@/types/jobPosts";

type ActiveJobFilters = {
  location?: string;
  jobType?: string;
  payType?: SalaryRate;
  keyword?: string;
  limit?: number;
  page?: number; // 1-based
};

export async function fetchActiveJobs(
  filters?: ActiveJobFilters
): Promise<JobPost[]> {
  const supabase = await createClient();

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
    query = query.eq("salary_rate", filters.payType);
  }
  if (filters?.keyword && filters.keyword.trim().length > 0) {
    const kw = filters.keyword.trim();
    query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching active jobs:", error);
    return [];
  }

  return data;
}

export async function fetchJobFilterOptions(): Promise<{
  locations: string[];
  jobTypes: string[];
  payTypes: string[];
}> {
  const supabase = await createClient();

  const [{ data: locationsData }, { data: jobTypesData }] = await Promise.all([
    supabase.from("job_posts").select("location").eq("is_active", true),
    supabase.from("job_posts").select("job_type").eq("is_active", true),
  ]);

  const locationsSet = new Set<string>();
  (locationsData ?? []).forEach((row: any) => {
    if (row.location) locationsSet.add(row.location as string);
  });
  const jobTypesSet = new Set<string>();
  (jobTypesData ?? []).forEach((row: any) => {
    if (row.job_type) jobTypesSet.add(row.job_type as string);
  });

  const locations = [
    "All",
    ...Array.from(locationsSet).sort((a, b) => a.localeCompare(b)),
  ];
  const jobTypes = [
    "All",
    ...Array.from(jobTypesSet).sort((a, b) => a.localeCompare(b)),
  ];
  const payTypes = ["All", "Per Hour", "Per Day", "Per Week", "Per Month"];

  return { locations, jobTypes, payTypes };
}
