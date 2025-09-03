import JobsCarousel from "./_components/JobsCarousel";
import {
  fetchActiveJobs,
  fetchJobFilterOptions,
} from "@/services/jobs/fetchActiveJobs";

export default async function About() {
  const jobs = await fetchActiveJobs({ limit: 24, page: 1 });
  const { locations, jobTypes, payTypes } = await fetchJobFilterOptions();

  return (
    <JobsCarousel
      jobs={jobs}
      locations={locations}
      jobTypes={jobTypes}
      payTypes={payTypes}
    />
  );
}
