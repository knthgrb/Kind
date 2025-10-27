import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";
import {
  areProvincesInSameRegion,
  getRegionForProvince,
} from "@/utils/regionMapping";

export interface JobMatch {
  jobId: string;
  job: any; // Full job object
  score: number;
  reasons: string[];
  breakdown: {
    jobTitle: number;
    jobType: number;
    location: number;
    salary: number;
    languages: number;
    skills: number;
    priority: number;
  };
}

export interface KindTaoJobPreferences {
  desiredJobs: string[];
  desiredLocations: string[];
  desiredJobTypes: string[];
  salaryRange: {
    min: number;
    max: number;
    salaryType: string;
  };
  preferredLanguages: string[];
  preferredWorkRadiusKm: number;
}

export class JobMatchingService {
  /**
   * Find matching jobs for a KindTao user based on their preferences
   */
  static async findMatchingJobs(
    kindtaoUserId: string,
    limit: number = 20
  ): Promise<JobMatch[]> {
    try {
      const supabase = await createClient();

      // Get user preferences
      const preferences = await this.getUserPreferences(
        supabase,
        kindtaoUserId
      );
      if (!preferences) {
        logger.warn(`No preferences found for user ${kindtaoUserId}`);
        return [];
      }

      // Get user location coordinates
      const userLocation = await this.getUserLocation(supabase, kindtaoUserId);

      // Get user skills from their profile
      const userSkills = await this.getUserSkills(supabase, kindtaoUserId);

      // Get jobs that user has already swiped on
      const { data: swipedJobs, error: swipedError } = await supabase
        .from("kindtao_job_interactions")
        .select("job_post_id")
        .eq("kindtao_user_id", kindtaoUserId);

      if (swipedError) {
        logger.error("Error fetching swiped jobs:", swipedError);
        return [];
      }

      const swipedJobIds = swipedJobs?.map((item) => item.job_post_id) || [];

      // Get active job posts, excluding already swiped jobs
      let query = supabase
        .from("job_posts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      // Only add the NOT IN filter if there are swiped jobs
      if (swipedJobIds.length > 0) {
        query = query.not("id", "in", `(${swipedJobIds.join(",")})`);
      }

      const { data: jobs, error } = await query;

      if (error) {
        logger.error("Error fetching job posts:", error);
        return [];
      }

      if (!jobs || jobs.length === 0) {
        return [];
      }

      // Calculate match scores for each job
      const matches = jobs.map((job) =>
        this.calculateJobMatch(preferences, job, userLocation, userSkills)
      );

      // Filter by minimum threshold and sort by score
      return matches
        .filter((match) => match.score > 0) // Only show jobs that actually match
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error("Error in findMatchingJobs:", error);
      return [];
    }
  }

  /**
   * Get user job preferences from database
   */
  private static async getUserPreferences(
    supabase: any,
    userId: string
  ): Promise<KindTaoJobPreferences | null> {
    const { data, error } = await supabase
      .from("kindtao_job_preferences")
      .select("*")
      .eq("kindtao_user_id", userId)
      .single();

    if (error) {
      logger.error("Error fetching user preferences:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      desiredJobs: data.desired_jobs || [],
      desiredLocations: data.desired_locations || [],
      desiredJobTypes: data.desired_job_types || [],
      salaryRange: {
        min: data.salary_range_min || 0,
        max: data.salary_range_max || 0,
        salaryType: data.salary_type || "daily",
      },
      preferredLanguages: data.desired_languages || [],
      preferredWorkRadiusKm: data.desired_job_location_radius || 10,
    };
  }

  /**
   * Get user location coordinates from database
   */
  private static async getUserLocation(
    supabase: any,
    userId: string
  ): Promise<{ lat: number; lng: number } | null> {
    const { data, error } = await supabase
      .from("users")
      .select("location_coordinates")
      .eq("id", userId)
      .single();

    if (error || !data?.location_coordinates) {
      logger.warn(`No location coordinates found for user ${userId}`);
      return null;
    }

    // Parse POINT format: (longitude, latitude)
    const match = data.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      };
    }

    return null;
  }

  /**
   * Get user skills from their KindTao profile
   */
  private static async getUserSkills(
    supabase: any,
    userId: string
  ): Promise<string[]> {
    try {
      const { data: profile, error } = await supabase
        .from("kindtao_profiles")
        .select("skills")
        .eq("kindtao_user_id", userId)
        .single();

      if (error || !profile) {
        logger.warn(`No profile found for user ${userId}`);
        return [];
      }

      return profile.skills || [];
    } catch (error) {
      logger.error("Error fetching user skills:", error);
      return [];
    }
  }

  /**
   * Calculate match score between user preferences and job post
   * Now includes skill matching and priority calculation
   */
  private static calculateJobMatch(
    preferences: KindTaoJobPreferences,
    job: any,
    userLocation?: { lat: number; lng: number } | null,
    userSkills?: string[]
  ): JobMatch {
    // Check if job title is in desired jobs OR if user has required skills
    const hasDesiredJobTitle = preferences.desiredJobs.includes(job.job_title);
    const hasRequiredSkills = this.calculateSkillMatch(
      userSkills || [],
      job.required_skills || []
    );

    // If neither job title matches nor skills match, skip this job
    if (!hasDesiredJobTitle && !hasRequiredSkills) {
      return {
        jobId: job.id,
        job: job,
        score: 0,
        reasons: ["Job type not in your preferences and skills don't match"],
        breakdown: {
          jobTitle: 0,
          jobType: 0,
          location: 0,
          salary: 0,
          languages: 0,
          skills: 0,
          priority: 0,
        },
      };
    }

    const breakdown = {
      jobTitle: hasDesiredJobTitle ? 100 : 0, // 100 if job title matches, 0 if only skills match
      jobType: this.calculateJobTypeMatch(
        preferences.desiredJobTypes,
        job.job_type
      ),
      location: this.calculateLocationMatch(preferences, job, userLocation),
      salary: this.calculateSalaryMatch(preferences.salaryRange, job),
      languages: this.calculateLanguageMatch(
        preferences.preferredLanguages,
        job.preferred_languages
      ),
      skills: this.calculateSkillMatch(
        userSkills || [],
        job.required_skills || []
      ),
      priority: this.calculatePriorityScore(job),
    };

    // Enhanced weighted score calculation with skills and priority
    const baseScore = Math.round(
      breakdown.jobTitle * 0.4 + // 40% - Job type match (reduced from 50%)
        breakdown.jobType * 0.2 + // 20% - Work arrangement (reduced from 25%)
        breakdown.location * 0.15 + // 15% - Geographic
        breakdown.salary * 0.08 + // 8% - Compensation
        breakdown.languages * 0.02 + // 2% - Languages
        breakdown.skills * 0.1 + // 10% - Skills match (NEW)
        breakdown.priority * 0.05 // 5% - Priority boost (NEW)
    );

    // Apply priority multiplier for boosted jobs
    const finalScore = job.is_boosted ? Math.round(baseScore * 1.5) : baseScore;

    return {
      jobId: job.id,
      job: job,
      score: finalScore,
      reasons: this.generateMatchReasons(breakdown),
      breakdown,
    };
  }

  /**
   * Calculate skill match between user skills and job required skills
   */
  private static calculateSkillMatch(
    userSkills: string[],
    requiredSkills: string[]
  ): number {
    if (!requiredSkills || requiredSkills.length === 0) {
      return 50; // Neutral score if no skills required
    }

    if (!userSkills || userSkills.length === 0) {
      return 0; // No skills match if user has no skills
    }

    // Convert to lowercase for case-insensitive matching
    const userSkillsLower = userSkills.map((skill) =>
      skill.toLowerCase().trim()
    );
    const requiredSkillsLower = requiredSkills.map((skill) =>
      skill.toLowerCase().trim()
    );

    // Count matching skills
    const matchingSkills = requiredSkillsLower.filter((requiredSkill) =>
      userSkillsLower.some(
        (userSkill) =>
          userSkill.includes(requiredSkill) || requiredSkill.includes(userSkill)
      )
    );

    // Calculate percentage of required skills that match
    const matchPercentage =
      (matchingSkills.length / requiredSkillsLower.length) * 100;

    return Math.round(matchPercentage);
  }

  /**
   * Calculate priority score based on job characteristics
   */
  private static calculatePriorityScore(job: any): number {
    let priorityScore = 50; // Base score

    // Boost status (highest priority)
    if (job.is_boosted && job.boost_expires_at) {
      const boostExpiry = new Date(job.boost_expires_at);
      const now = new Date();
      if (boostExpiry > now) {
        priorityScore += 30; // Boosted jobs get +30 points
      }
    }

    // Job freshness (newer jobs get higher priority)
    const jobAge = Date.now() - new Date(job.created_at).getTime();
    const daysOld = jobAge / (1000 * 60 * 60 * 24);

    if (daysOld < 1) {
      priorityScore += 20; // Less than 1 day old
    } else if (daysOld < 3) {
      priorityScore += 15; // Less than 3 days old
    } else if (daysOld < 7) {
      priorityScore += 10; // Less than 1 week old
    } else if (daysOld < 14) {
      priorityScore += 5; // Less than 2 weeks old
    }

    // Salary attractiveness (higher salary = higher priority)
    if (job.salary_min && job.salary_max) {
      const avgSalary = (job.salary_min + job.salary_max) / 2;
      if (avgSalary > 1000) {
        priorityScore += 10; // High-paying jobs
      } else if (avgSalary > 500) {
        priorityScore += 5; // Medium-paying jobs
      }
    }

    // Job urgency (if expires soon, higher priority)
    if (job.expires_at) {
      const expiryDate = new Date(job.expires_at);
      const daysUntilExpiry =
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

      if (daysUntilExpiry < 3) {
        priorityScore += 15; // Expires soon
      } else if (daysUntilExpiry < 7) {
        priorityScore += 10; // Expires within a week
      }
    }

    return Math.min(priorityScore, 100); // Cap at 100
  }

  /**
   * Calculate job type match - show jobs even if not exact match
   */
  private static calculateJobTypeMatch(
    desiredJobTypes: string[],
    jobType: string
  ): number {
    if (desiredJobTypes.includes(jobType)) {
      return 100; // Perfect match
    }

    // Still show jobs even if job type doesn't match exactly
    // This allows users to see jobs they might be interested in
    return 60; // Lower score but still show
  }

  /**
   * Calculate location match with radius support
   */
  private static calculateLocationMatch(
    preferences: KindTaoJobPreferences,
    job: any,
    userLocation?: { lat: number; lng: number } | null
  ): number {
    // Exact location match (string-based)
    if (preferences.desiredLocations.includes(job.location)) {
      return 100;
    }

    // Spatial distance-based matching
    if (
      userLocation &&
      job.location_coordinates &&
      preferences.preferredWorkRadiusKm > 0
    ) {
      try {
        // Parse job coordinates
        const jobCoordsMatch =
          job.location_coordinates.match(/\(([^,]+),([^)]+)\)/);
        if (jobCoordsMatch) {
          const jobLng = parseFloat(jobCoordsMatch[1]);
          const jobLat = parseFloat(jobCoordsMatch[2]);

          // Calculate distance using Haversine formula
          const distance = this.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            jobLat,
            jobLng
          );

          // Score based on distance within radius
          if (distance <= preferences.preferredWorkRadiusKm) {
            // Score decreases as distance increases within radius
            const score = Math.max(
              60,
              100 - (distance / preferences.preferredWorkRadiusKm) * 40
            );
            return Math.round(score);
          } else {
            // Outside radius but still show with lower score
            return 30;
          }
        }
      } catch (error) {
        logger.warn("Error calculating location distance:", error);
      }
    }

    // 2. Region-based matching - 80 points
    if (job.province && job.region) {
      const regionMatch = this.calculateRegionMatch(
        preferences.desiredLocations,
        job.province,
        job.region
      );
      if (regionMatch > 0) {
        return regionMatch;
      }
    }

    // 3. Fuzzy location match (region/city level) - 90 points
    const fuzzyMatch = this.calculateFuzzyLocationMatch(
      preferences.desiredLocations,
      job.location
    );
    if (fuzzyMatch > 0) {
      return fuzzyMatch;
    }

    // Fallback: show jobs even if location doesn't match exactly
    // This allows users to see jobs they might be willing to travel for
    return 50; // Neutral score for non-matching locations
  }

  /**
   * Calculate fuzzy location match for region/city level matching
   */
  private static calculateFuzzyLocationMatch(
    desiredLocations: string[],
    jobLocation: string
  ): number {
    if (!jobLocation || desiredLocations.length === 0) return 0;

    const jobLocationLower = jobLocation.toLowerCase().trim();

    for (const desiredLocation of desiredLocations) {
      const desiredLower = desiredLocation.toLowerCase().trim();

      // Exact match (already handled above, but good to have)
      if (desiredLower === jobLocationLower) {
        return 100;
      }

      // City name match (e.g., "Makati" matches "Makati City")
      if (
        jobLocationLower.includes(desiredLower) ||
        desiredLower.includes(jobLocationLower)
      ) {
        return 90;
      }
    }

    return 0;
  }

  /**
   * Calculate region-based matching
   */
  private static calculateRegionMatch(
    desiredLocations: string[],
    jobProvince: string,
    jobRegion: string
  ): number {
    if (!jobProvince || !jobRegion || desiredLocations.length === 0) return 0;

    for (const desiredLocation of desiredLocations) {
      const desiredLower = desiredLocation.toLowerCase().trim();

      // Check if desired location is in the same region
      const regionInfo = getRegionForProvince(desiredLocation);
      if (regionInfo && regionInfo.region === jobRegion) {
        return 80; // Same region
      }

      // Check if provinces are in the same region
      if (areProvincesInSameRegion(desiredLocation, jobProvince)) {
        return 85; // Same region, different province
      }
    }

    return 0;
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
   * Calculate salary match with flexible thresholds
   */
  private static calculateSalaryMatch(
    salaryRange: { min: number; max: number; salaryType: string },
    job: any
  ): number {
    if (salaryRange.min === 0 && salaryRange.max === 0) {
      return 50; // No preference = neutral
    }

    // Parse job salary (assuming it's stored as string like "₱500")
    const jobSalary = this.parseJobSalary(job.salary);
    if (jobSalary === 0) {
      return 50; // No salary info = neutral
    }

    const userMin = salaryRange.min;
    const userMax = salaryRange.max;

    // Perfect overlap
    if (jobSalary >= userMin && jobSalary <= userMax) {
      return 100;
    }

    // Calculate threshold (20% flexibility)
    const threshold = Math.max(userMin * 0.2, 100); // At least 100 pesos threshold
    const lowerBound = userMin - threshold;
    const upperBound = userMax + threshold;

    // Within flexible threshold
    if (jobSalary >= lowerBound && jobSalary <= upperBound) {
      return 80; // Close match
    }

    // Job pays significantly more than expected
    if (jobSalary > upperBound) {
      return 70; // Still show but lower score
    }

    // Job pays significantly less than expected
    if (jobSalary < lowerBound) {
      return 40; // Lower score but still show
    }

    return 50; // Default neutral score
  }

  /**
   * Parse job salary from string format
   */
  private static parseJobSalary(salaryString: string): number {
    if (!salaryString) return 0;

    // Remove currency symbols and extract number
    const match = salaryString.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, "")) : 0;
  }

  /**
   * Calculate language match - more flexible matching
   */
  private static calculateLanguageMatch(
    preferredLanguages: string[],
    requiredLanguages: string[]
  ): number {
    if (!requiredLanguages || requiredLanguages.length === 0) {
      return 100; // No language requirement
    }

    if (preferredLanguages.length === 0) {
      return 50; // No language preference = neutral
    }

    const overlap = preferredLanguages.filter((lang) =>
      requiredLanguages.includes(lang)
    );

    if (overlap.length === 0) {
      // No language overlap - still show but with lower score
      return 30; // Lower score but still show
    }

    return (overlap.length / requiredLanguages.length) * 100;
  }

  /**
   * Generate human-readable match reasons
   */
  private static generateMatchReasons(breakdown: any): string[] {
    const reasons: string[] = [];

    if (breakdown.jobTitle === 100) {
      reasons.push("Job type matches your preferences");
    }

    if (breakdown.jobType === 100) {
      reasons.push("Work arrangement matches your preferences");
    } else if (breakdown.jobType >= 60) {
      reasons.push("Work arrangement is close to your preferences");
    }

    if (breakdown.location === 100) {
      reasons.push("Location matches your preferences");
    } else if (breakdown.location >= 50) {
      reasons.push("Location is outside your preferred areas");
    }

    if (breakdown.salary >= 80) {
      reasons.push("Salary meets your expectations");
    } else if (breakdown.salary >= 60) {
      reasons.push("Salary is close to your expectations");
    } else if (breakdown.salary >= 40) {
      reasons.push("Salary is below your expectations");
    }

    if (breakdown.languages >= 80) {
      reasons.push("Language requirements match your skills");
    } else if (breakdown.languages >= 30) {
      reasons.push("Some language requirements may not match");
    }

    if (breakdown.skills >= 80) {
      reasons.push("Your skills match the job requirements");
    } else if (breakdown.skills >= 60) {
      reasons.push("Most of your skills match the job requirements");
    } else if (breakdown.skills >= 40) {
      reasons.push("Some of your skills match the job requirements");
    } else if (breakdown.skills > 0) {
      reasons.push("Few of your skills match the job requirements");
    }

    if (breakdown.priority >= 80) {
      reasons.push("High priority job");
    } else if (breakdown.priority >= 60) {
      reasons.push("Good priority job");
    }

    return reasons;
  }
}
