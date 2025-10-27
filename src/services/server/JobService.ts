import { createClient } from "@/utils/supabase/server";
import { JobPost, SalaryRate, JobType } from "@/types/jobPosts";
import { JobMatchingService, JobMatch } from "./JobMatchingService";

export type JobFilters = {
  search?: string;
  province?: string;
  radius?: number;
  jobType?: string;
  userLat?: number;
  userLng?: number;
  limit?: number;
  offset?: number;
  page?: number; // 1-based, alternative to offset
};

export type JobFilterOptions = {
  provinces: string[];
  jobTypes: string[];
};

export class JobService {
  /**
   * Fetch job by ID
   */
  static async fetchById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_posts")
      .select(
        `
        id,
        kindbossing_user_id,
        job_title,
        job_description,
        location,
        salary,
        job_type,
        required_skills,
        work_schedule,
        required_years_of_experience,
        preferred_languages,
        is_boosted,
        boost_expires_at,
        status,
        created_at,
        updated_at
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      return null;
    }

    if (!data) return null;

    const result = {
      id: String(data.id),
      kindbossing_user_id: String(data.kindbossing_user_id),
      job_title: String(data.job_title),
      job_description: String(data.job_description || ""),
      job_type: data.job_type,
      location: String(data.location),
      salary: String(data.salary || ""),
      required_skills: Array.isArray(data.required_skills)
        ? data.required_skills
        : [],
      work_schedule: data.work_schedule || null,
      required_years_of_experience: Number(
        data.required_years_of_experience || 0
      ),
      preferred_languages: Array.isArray(data.preferred_languages)
        ? data.preferred_languages
        : [],
      is_boosted: Boolean(data.is_boosted),
      boost_expires_at: data.boost_expires_at
        ? String(data.boost_expires_at)
        : null,
      status: (data.status || "active") as "active" | "paused" | "closed",
      created_at: String(data.created_at),
      updated_at: String(data.updated_at),
    };

    return JSON.parse(JSON.stringify(result));
  }

  /**
   * Fetch jobs with filters (server-side)
   */
  static async fetchJobs(filters?: JobFilters): Promise<JobPost[]> {
    const supabase = await createClient();

    let query = supabase
      .from("job_posts")
      .select(
        `
        id,
        kindbossing_user_id,
        job_title,
        job_description,
        required_skills,
        salary,
        work_schedule,
        required_years_of_experience,
        location,
        preferred_languages,
        status,
        is_boosted,
        boost_expires_at,
        updated_at,
        job_type,
        created_at
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.jobType && filters.jobType !== "All") {
      query = query.eq("job_type", filters.jobType);
    }

    // Handle search
    if (filters?.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim().replace(/%/g, "");
      query = query.or(
        `job_title.ilike.%${searchTerm}%,job_description.ilike.%${searchTerm}%,required_skills.cs.{${searchTerm}}`
      );
    }

    // Handle province filtering
    if (filters?.province && filters.province !== "All") {
      query = query.ilike("location", `%${filters.province}%`);
    }

    // Handle pagination
    if (filters?.limit) {
      if (filters.offset !== undefined) {
        // Use offset-based pagination
        const from = filters.offset;
        const to = filters.offset + filters.limit - 1;
        query = query.range(from, to);
      } else if (filters.page) {
        // Use page-based pagination (1-based)
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      } else {
        // Just limit without pagination
        query = query.limit(filters.limit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }

    // Convert job_posts schema to JobPost format
    const jobs = (data ?? []).map((job) => {
      return {
        id: String(job.id),
        kindbossing_user_id: String(job.kindbossing_user_id),
        job_title: String(job.job_title),
        job_description: String(job.job_description || ""),
        job_type: job.job_type as any,
        location: String(job.location),
        salary: String(job.salary || ""),
        required_skills: Array.isArray(job.required_skills)
          ? job.required_skills
          : [],
        work_schedule: job.work_schedule || null,
        required_years_of_experience: Number(
          job.required_years_of_experience || 0
        ),
        preferred_languages: Array.isArray(job.preferred_languages)
          ? job.preferred_languages
          : [],
        is_boosted: Boolean(job.is_boosted),
        boost_expires_at: job.boost_expires_at
          ? String(job.boost_expires_at)
          : null,
        status: (job.status || "active") as "active" | "paused" | "closed",
        created_at: String(job.created_at),
        updated_at: String(job.updated_at),
      };
    });

    // Apply radius filtering if user coordinates are provided
    if (filters?.userLat && filters?.userLng && filters?.radius) {
      return this.filterByRadius(
        jobs,
        filters.userLat,
        filters.userLng,
        filters.radius
      );
    }

    return jobs;
  }

  /**
   * Parse salary range string (e.g., "15000-25000", "20000+", "<30000")
   */
  private static parseSalaryRange(
    salaryRange: string
  ): { min: number; max: number } | null {
    const cleanRange = salaryRange.replace(/[^\d\-\+<]/g, "");

    if (cleanRange.includes("-")) {
      const [min, max] = cleanRange.split("-").map(Number);
      return { min: min || 0, max: max || 0 };
    } else if (cleanRange.includes("+")) {
      const min = parseInt(cleanRange.replace("+", ""));
      return { min: min || 0, max: min * 2 }; // Assume max is 2x min
    } else if (cleanRange.startsWith("<")) {
      const max = parseInt(cleanRange.replace("<", ""));
      return { min: 0, max: max || 0 };
    } else {
      const amount = parseInt(cleanRange);
      if (amount) {
        return { min: amount * 0.8, max: amount * 1.2 }; // ±20% range
      }
    }

    return null;
  }

  /**
   * Filter jobs by radius using Haversine formula
   */
  private static filterByRadius(
    jobs: JobPost[],
    userLat: number,
    userLng: number,
    radiusKm: number
  ): JobPost[] {
    if (!userLat || !userLng || radiusKm <= 0) {
      return jobs;
    }

    return jobs.filter((job) => {
      // For now, we'll use a simplified approach since job locations are stored as strings
      // In a real implementation, you'd store lat/lng coordinates for each job
      // and calculate the actual distance using the Haversine formula

      // Extract province from job location
      const jobLocation = job.location?.toLowerCase() || "";
      const userProvince = this.extractProvinceFromLocation(jobLocation);

      // If we can't determine the province, include the job
      if (!userProvince) return true;

      // For now, we'll include jobs within the same province
      // This is a simplified implementation - in production you'd want to:
      // 1. Store lat/lng coordinates for each job location
      // 2. Use the Haversine formula to calculate actual distances
      // 3. Filter based on the calculated distance

      return true; // Simplified: include all jobs for now
    });
  }

  /**
   * Extract province from location string
   */
  private static extractProvinceFromLocation(location: string): string | null {
    if (!location) return null;

    // Common province patterns in the Philippines
    const provinces = [
      "metro manila",
      "manila",
      "quezon city",
      "makati",
      "taguig",
      "pasig",
      "cebu",
      "davao",
      "cagayan",
      "laguna",
      "cavite",
      "bulacan",
      "pampanga",
      "bataan",
      "rizal",
      "nueva ecija",
      "tarlac",
      "zambales",
      "aurora",
      "batangas",
      "cavite",
      "laguna",
      "quezon",
      "rizal",
      "marinduque",
      "occidental mindoro",
      "oriental mindoro",
      "palawan",
      "romblon",
      "albay",
      "camarines norte",
      "camarines sur",
      "catanduanes",
      "masbate",
      "sorsogon",
      "aklan",
      "antique",
      "capiz",
      "guimaras",
      "iloilo",
      "negros occidental",
      "bohol",
      "cebu",
      "negros oriental",
      "siquijor",
      "biliran",
      "eastern samar",
      "leyte",
      "northern samar",
      "southern leyte",
      "western samar",
      "zamboanga del norte",
      "zamboanga del sur",
      "zamboanga sibugay",
      "bukidnon",
      "camiguin",
      "lanao del norte",
      "misamis occidental",
      "misamis oriental",
      "davao del norte",
      "davao del sur",
      "davao occidental",
      "davao oriental",
      "compostela valley",
      "cotabato",
      "sarangani",
      "south cotabato",
      "agusan del norte",
      "agusan del sur",
      "dinagat islands",
      "surigao del norte",
      "surigao del sur",
      "basilan",
      "lanao del sur",
      "maguindanao",
      "sulu",
      "tawi-tawi",
    ];

    const lowerLocation = location.toLowerCase();
    for (const province of provinces) {
      if (lowerLocation.includes(province)) {
        return province;
      }
    }

    return null;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Fetch jobs with filters (client-side)
   */
  static async fetchJobsClient(filters?: JobFilters): Promise<JobPost[]> {
    const supabase = await createClient();

    let query = supabase
      .from("job_posts")
      .select(
        `
        id,
        kindbossing_user_id,
        title,
        description,
        location,
        salary,
        job_type,
        required_skills,
        work_schedule,
        required_years_of_experience,
        preferred_languages,
        is_boosted,
        boost_expires_at,
        status,
        created_at,
        updated_at
        `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    // Apply search filter
    if (filters?.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim().replace(/%/g, "");
      query = query.or(
        `job_title.ilike.%${searchTerm}%,job_description.ilike.%${searchTerm}%,required_skills.cs.{${searchTerm}}`
      );
    }

    // Apply province filter
    if (filters?.province && filters.province !== "All") {
      query = query.ilike("location", `%${filters.province}%`);
    }

    // Apply job type filter
    if (filters?.jobType && filters.jobType !== "All") {
      query = query.eq("job_type", filters.jobType);
    }

    // Handle pagination
    if (filters?.limit) {
      if (filters.offset !== undefined) {
        // Use offset-based pagination
        const from = filters.offset;
        const to = filters.offset + filters.limit - 1;
        query = query.range(from, to);
      } else if (filters.page) {
        // Use page-based pagination (1-based)
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      } else {
        // Just limit without pagination
        query = query.limit(filters.limit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs (client):", error);
      return [];
    }

    // Transform and filter jobs
    const jobs = (data || []).map((job) => {
      return {
        id: String(job.id),
        kindbossing_user_id: String(job.kindbossing_user_id),
        job_title: String(job.title || ""),
        job_description: String(job.description || ""),
        job_type: job.job_type as JobType | null,
        location: String(job.location || ""),
        salary: String(job.salary || ""),
        required_skills: Array.isArray(job.required_skills)
          ? job.required_skills
          : [],
        work_schedule: job.work_schedule || null,
        required_years_of_experience: Number(
          job.required_years_of_experience || 0
        ),
        preferred_languages: Array.isArray(job.preferred_languages)
          ? job.preferred_languages
          : [],
        is_boosted: Boolean(job.is_boosted),
        boost_expires_at: job.boost_expires_at
          ? String(job.boost_expires_at)
          : null,
        status: (job.status || "active") as "active" | "paused" | "closed",
        created_at: String(job.created_at || ""),
        updated_at: String(job.updated_at || ""),
      };
    });

    // Apply radius filtering if user coordinates are provided
    if (filters?.userLat && filters?.userLng && filters?.radius) {
      return this.filterByRadius(
        jobs,
        filters.userLat,
        filters.userLng,
        filters.radius
      );
    }

    return jobs;
  }

  /**
   * Fetch job posts by kindBossing user
   */
  static async fetchJobPostsByKindBossing(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("job_posts")
      .select("*")
      .eq("kindbossing_user_id", userId)
      .eq("status", "active");

    if (error) {
      console.error("Error fetching job posts:", error);
      return [];
    }

    return data ?? [];
  }

  /**
   * Fetch paginated job posts by kindBossing user
   */
  static async fetchPaginatedKindBossingPosts(
    userId: string,
    page: number,
    pageSize: number
  ) {
    const supabase = await createClient();

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: jobs,
      error: jobsError,
      count,
    } = await supabase
      .from("job_posts")
      .select("*", { count: "exact" })
      .eq("kindbossing_user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (jobsError) {
      console.error("Error fetching paginated job posts:", jobsError);
      return { jobs: [], total: 0 };
    }

    return { jobs: jobs ?? [], total: count ?? 0 };
  }

  /**
   * Get filter options
   */
  static async fetchJobFilterOptions(): Promise<JobFilterOptions> {
    const supabase = await createClient();

    const [{ data: locationsData }, { data: jobTypesData }] = await Promise.all(
      [
        supabase.from("job_posts").select("location").eq("status", "active"),
        supabase.from("job_posts").select("job_type").eq("status", "active"),
      ]
    );

    // Extract provinces from locations
    const provincesSet = new Set<string>();
    (locationsData ?? []).forEach((row: { location?: string }) => {
      if (row.location) {
        // Extract province from location string
        const parts = row.location.split(",").map((p) => p.trim());
        const province = parts[parts.length - 1]; // Assume province is the last part
        if (province) provincesSet.add(province);
      }
    });

    const jobTypesSet = new Set<string>();
    (jobTypesData ?? []).forEach((row: { job_type?: string }) => {
      if (row.job_type) jobTypesSet.add(row.job_type);
    });

    const provinces = [
      "All",
      ...Array.from(provincesSet).sort((a, b) => a.localeCompare(b)),
    ];
    const jobTypes = [
      "All",
      "Hourly",
      "Daily",
      "Contractual",
      "Full-time",
      "Part-time",
      "Freelance",
      "Temporary",
      "Permanent",
      ...Array.from(jobTypesSet).sort((a, b) => a.localeCompare(b)),
    ];

    return { provinces, jobTypes };
  }

  /**
   * Convenience function for latest jobs
   */
  static async fetchLatestJobs(
    limit: number = 8,
    filters?: Omit<JobFilters, "limit" | "offset" | "page">
  ): Promise<JobPost[]> {
    return this.fetchJobs({ ...filters, limit });
  }

  /**
   * Fetch matched jobs for KindTao users using matching algorithm
   */
  static async fetchMatchedJobs(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<JobMatch[]> {
    return JobMatchingService.findMatchingJobs(userId, limit);
  }

  /**
   * Fetch matched jobs for KindTao users using matching algorithm (client-side)
   */
  static async fetchMatchedJobsClient(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<JobMatch[]> {
    return JobMatchingService.findMatchingJobs(userId, limit);
  }
}
