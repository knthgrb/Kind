"use client";

import { useState, useMemo, useEffect } from "react";
import JobCard from "@/components/jobs/JobCard";
import JobSearch, { Filters } from "@/components/jobs/JobSearch";
import { FaArrowRight } from "react-icons/fa6";
import { JobPost, SalaryRate } from "@/types/jobPosts";
import { fetchLatestJobs } from "@/services/jobs/(kindTao)/latestJobs";

type Props = {
  latestJobs: JobPost[];
  locations: string[];
  jobTypes: string[];
  payTypes: string[];
};

export default function JobsGrid({
  latestJobs,
  locations,
  jobTypes,
  payTypes,
}: Props) {
  const [filters, setFilters] = useState<Filters>({
    tags: [],
    location: "All",
    jobType: "All",
    payType: "All",
    keyword: "",
  });
  const [serverJobs, setServerJobs] = useState<JobPost[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (next: Filters) => {
    setFilters(next);
    setLoading(true);
    try {
      const jobs = await fetchLatestJobs({
        location: next.location,
        jobType: next.jobType,
        payType: next.payType as SalaryRate,
        keyword: next.keyword,
        tags: next.tags,
        limit: 8,
      });
      setServerJobs(jobs);
    } catch (e) {
      console.error("Failed to search jobs", e);
      setServerJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const jobsToRender = useMemo(() => {
    if (serverJobs) return serverJobs;
    return latestJobs;
  }, [serverJobs, latestJobs]);

  return (
    <section className="px-4">
      <div className="max-w-[1100px] mx-auto">
        <JobSearch
          locations={locations}
          jobTypes={jobTypes}
          payTypes={payTypes}
          onSearch={handleSearch}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 p-5 mt-6">
          {loading ? (
            <p className="text-gray-500 col-span-full">Loading…</p>
          ) : jobsToRender.length > 0 ? (
            jobsToRender.map((job) => <JobCard key={job.id} job={job} />)
          ) : (
            <p className="text-gray-500 col-span-full">No jobs found.</p>
          )}
        </div>

        <div className="flex justify-center w-full my-8">
          <button className="py-3 px-8 bg-white text-[#CC0000] border border-[#CC0000] rounded-lg hover:bg-[#CC0000] hover:text-white w-full sm:w-auto">
            <span className="flex items-center gap-2 text-sm !font-bold justify-center">
              View All
              <FaArrowRight />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
