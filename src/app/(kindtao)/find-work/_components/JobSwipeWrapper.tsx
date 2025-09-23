"use client";

import { JobPost } from "@/types/jobPosts";
import { Filters } from "@/components/jobs/JobSearch";
import JobSwipe from "./JobSwipe";

type JobSwipeWrapperProps = {
  initialJobs: JobPost[];
  pageSize: number;
  locations: string[];
  jobTypes: string[];
  payTypes: string[];
  initialFilters?: Filters;
  initialSwipeLimit?: {
    remainingSwipes: number;
    dailyLimit: number;
    canSwipe: boolean;
  };
};

export default function JobSwipeWrapper({
  initialJobs,
  pageSize,
  locations,
  jobTypes,
  payTypes,
  initialFilters,
  initialSwipeLimit,
}: JobSwipeWrapperProps) {
  return (
    <JobSwipe
      initialJobs={initialJobs}
      pageSize={pageSize}
      locations={locations}
      jobTypes={jobTypes}
      payTypes={payTypes}
      initialFilters={initialFilters}
      initialSwipeLimit={initialSwipeLimit}
    />
  );
}
