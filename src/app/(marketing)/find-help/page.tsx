import React from "react";
import Header from "../_components/Header";
import Footer from "../_components/Footer";

export default function FindHelpPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Find Help
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Get the help you need with our comprehensive support resources.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Frequently Asked Questions
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Find answers to common questions about our platform and
                    services.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Contact Support
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Get in touch with our support team for personalized
                    assistance.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Guide
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Learn how to make the most of our platform with our detailed
                    guides.
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Video Tutorials
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Watch step-by-step tutorials to get started quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
