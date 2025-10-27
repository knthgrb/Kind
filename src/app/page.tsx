import Hero from "@/app/(marketing)/_components/Hero";
import SectionHeader from "@/app/(marketing)/_components/SectionHeading";
import BrowseCategories from "@/app/(marketing)/_components/BrowseCategories";
import StepsCardGrid from "@/app/(marketing)/_components/StepsCardGrid";
import PricingCTA from "@/app/(marketing)/_components/PricingCTA";
import FaqAccordion from "@/app/(marketing)/_components/FaqAccordion";
import Subscribe from "@/app/(marketing)/_components/Subscribe";

import {
  categories,
  howItWorksSteps,
  benefitsList,
  faqs,
} from "@/lib/marketing/homeData";
import { JobService } from "@/services/server/JobService";
import JobsGrid from "@/components/common/JobsGrid";
import Header from "@/app/(marketing)/_components/Header";
import Footer from "@/app/(marketing)/_components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kind - Find Your Perfect Match",
  description: "Find your perfect kindTao",
  keywords: ["Kind", "KindTao", "KindBossing", "KindTao", "KindBossing"],
  authors: [{ name: "Kind", url: "https://kind.com" }],
  creator: "Kind",
  publisher: "Kind",
  openGraph: {
    title: "Kind - Find Your Perfect Match",
    description: "Find your perfect kindTao",
  },
};

export default async function Home() {
  const [{ provinces: locations, jobTypes }, latestJobs] = await Promise.all([
    JobService.fetchJobFilterOptions(),
    JobService.fetchLatestJobs(8),
  ]);

  return (
    <>
      <Header />
      <Hero />
      <div className="px-4 lg:px-0 max-w-7xl mx-auto">
        <SectionHeader
          title="Browse by Category"
          description={`Find exactly the help you're looking for. Hundreds of<br/> new jobs and kindTao available everyday.`}
          className="pt-20 sm:pt-38 bg-white"
        />

        {/* Pass categories to BrowseCategories */}
        <BrowseCategories categories={categories} />

        <SectionHeader
          title="How it Works"
          description={`Lorem Ipsum is simply dummy text of the printing and typesetting`}
          className="pt-30 bg-white"
        />

        <StepsCardGrid steps={howItWorksSteps} />

        <div className="bg-[#fcf7f7] py-15 my-15 rounded-2xl">
          <SectionHeader
            title="Find Your Perfect Match"
            description="Search and discover the right kindTao for your needs."
            className="bg-transparent"
          />

          <JobsGrid
            locations={locations}
            jobTypes={jobTypes}
            payTypes={["All", "Hourly", "Daily", "Monthly", "Fixed"]}
            latestJobs={latestJobs}
          />
        </div>

        <SectionHeader
          title="Benefits"
          description={`Lorem Ipsum is simply dummy text of the printing and typesetting.`}
          className="pt-15 bg-white"
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {benefitsList.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <div className="w-16 h-16 bg-[#CC0000] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {benefit.icon}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        <PricingCTA />

        <SectionHeader
          title="Frequently Asked Questions"
          description={`Get answers to common questions about our platform`}
          className="bg-white"
        />

        <FaqAccordion faq={faqs} />

        <Subscribe />
      </div>
      <Footer />
    </>
  );
}
