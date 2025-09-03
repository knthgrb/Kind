"use client";

import { useState, useRef, useEffect } from "react";
import JobCard from "@/components/jobs/JobCard";
import { JobPost, JobType } from "@/types/jobPosts";
import JobSearch, { Filters } from "@/components/jobs/JobSearch";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { fetchActiveJobsClient } from "@/services/jobs/fetchActiveJobs.client";

import "swiper/css";
import "swiper/css/navigation";

type Props = {
  jobs: JobPost[];
  locations: string[];
  jobTypes: string[];
  payTypes: string[];
};

export default function JobsCarousel({
  jobs,
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

  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [items, setItems] = useState<JobPost[]>(jobs);
  const [offset, setOffset] = useState<number>(jobs.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 24;

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filteredJobs = items.filter((job) => {
    const text = `${job.title} ${job.description} ${job.job_type ?? ""} ${
      job.location
    } ${job.salary_min} ${job.salary_max} ${job.salary_rate}`.toLowerCase();

    return (
      filters.tags.every((tag) => text.includes(tag.toLowerCase())) &&
      (filters.location === "All" || job.location === filters.location) &&
      (filters.jobType === "All" || (job.job_type ?? "") === filters.jobType) &&
      (filters.payType === "All" || job.salary_rate === filters.payType)
    );
  });

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const more = await fetchActiveJobsClient({
        location: filters.location,
        jobType: filters.jobType,
        payType: filters.payType as any,
        keyword: filters.keyword,
        tags: filters.tags,
        limit: PAGE_SIZE,
        offset,
      });
      if (more.length > 0) {
        setItems((prev) => [...prev, ...more]);
        setOffset((prev) => prev + more.length);
      }
    } catch (e) {
      console.error("Failed to load more jobs", e);
    } finally {
      setLoadingMore(false);
    }
  };

  // reset items when filters change (skip first render to keep SSR items)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoadingMore(true);
      try {
        const first = await fetchActiveJobsClient({
          location: filters.location,
          jobType: filters.jobType,
          payType: filters.payType as any,
          keyword: filters.keyword,
          tags: filters.tags,
          limit: PAGE_SIZE,
          offset: 0,
        });
        if (!cancelled) {
          setItems(first);
          setOffset(first.length);
        }
      } finally {
        if (!cancelled) setLoadingMore(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    filters.location,
    filters.jobType,
    filters.payType,
    filters.keyword,
    filters.tags.join(","),
  ]);

  // re-init navigation once swiper + refs are ready
  useEffect(() => {
    if (swiperInstance && prevRef.current && nextRef.current) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;

      swiperInstance.navigation.destroy();
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance, prevRef.current, nextRef.current]);

  return (
    <section className="px-4">
      <div>
        {/* Search */}
        <div className="max-w-6xl mx-auto pb-10">
          <JobSearch
            locations={locations}
            jobTypes={jobTypes}
            payTypes={payTypes}
            onSearch={setFilters}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Carousel */}
          <Swiper
            modules={[Navigation]}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={5}
            spaceBetween={0}
            loop={filteredJobs.length > 5}
            onReachEnd={loadMore}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 0,
                loop: filteredJobs.length > 1,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 0,
                loop: filteredJobs.length > 3,
              },
              1300: {
                slidesPerView: 5,
                spaceBetween: 0,
                loop: filteredJobs.length > 5,
              },
            }}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            className="mySwiper overflow-visible"
          >
            {filteredJobs.map((job) => (
              <SwiperSlide key={job.id}>
                <JobCard job={job} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <div className="flex justify-center items-center gap-8 mt-4">
            <button
              ref={prevRef}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              ref={nextRef}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
