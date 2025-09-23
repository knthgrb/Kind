"use client";

import { JobPost } from "@/types/jobPosts";
import DesktopJobSwipe from "./DesktopJobSwipe";

type MatchingScore = {
  jobId: string;
  score: number;
  reasons: string[];
  breakdown: {
    jobTypeMatch: number;
    locationMatch: number;
    salaryMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    availabilityMatch: number;
    ratingBonus: number;
    recencyBonus: number;
  };
};

type Props = {
  jobs: JobPost[];
  matchingScores?: MatchingScore[];
  initialSwipeLimit?: {
    remainingSwipes: number;
    dailyLimit: number;
    canSwipe: boolean;
  };
};

export default function JobsCarousel({
  jobs,
  matchingScores = [],
  initialSwipeLimit,
}: Props) {
  const PAGE_SIZE = 24;

  return (
    <section className="px-4">
      <DesktopJobSwipe
        initialJobs={jobs}
        initialMatchingScores={matchingScores}
        pageSize={PAGE_SIZE}
        initialSwipeLimit={initialSwipeLimit}
      />
    </section>
  );
}
