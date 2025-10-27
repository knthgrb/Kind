import Image from "next/image";
import { LuSearch } from "react-icons/lu";

export default function Hero() {
  return (
    <section className="relative bg-white pt-6 sm:pt-10 w-full px-4 sm:px-0 max-w-7xl mx-auto my-20 sm:my-10">
      <div className="w-full flex flex-col sm:flex-row justify-between">
        {/* Hero Text */}
        <div className="w-full sm:w-2/3 flex flex-col justify-start flex-grow pt-6 sm:pt-10 px-2 sm:px-4 text-center md:text-left max-w-2xl">
          <h1 className="text-[#05264E] leading-tight mb-3 sm:mb-4 headingH1 md:max-w-[90%]">
            Connecting{" "}
            <span className="text-[#CC0000] headingH1">kindBossing</span> with
            Trusted <span className="text-[#CC0000] headingH1">kindTao</span>
          </h1>
          <p className="headingP mb-4 sm:mb-6 mt-2 sm:mt-4 md:max-w-[90%]">
            Easily find verified yayas, caregivers, drivers, and household
            service providers near you. Safe, fast, and reliable hiring has
            never been simpler.
          </p>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:max-w-[90%]">
            <div className="flex w-full max-w-2xl rounded-lg shadow-lg py-2 px-3 sm:px-4">
              <input
                type="text"
                placeholder="What help do you need today? (e.g., Yaya, Caregiver, Driver)"
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-l-lg text-lg w-full text-black text-[clamp(0.6rem,1.2vw,1.1rem)] focus:outline-none"
              />

              <button className="py-2 sm:py-3 px-3 sm:px-4 gap-2 bg-[#CC0000] text-white rounded-lg text-lg hover:bg-red-700 w-auto sm:w-auto flex items-center justify-center">
                <LuSearch className="text-base" />
                <span className="hidden sm:inline text-sm">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden md:block mt-6 sm:mt-0 relative w-full sm:w-1/2 px-4 ml-2">
          <Image
            src="/homepage/hero-1.png"
            alt="Hero Right Image"
            width={378}
            height={335}
            className="object-cover w-[80%] h-auto"
          />
          <Image
            src="/homepage/hero-2.png"
            alt="Hero Left Image"
            width={307}
            height={193.2}
            className="object-cover absolute top-1/2 right-4 translate-y-1/3 w-[60%] h-auto"
          />
        </div>
      </div>
    </section>
  );
}
