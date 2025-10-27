import BusinessInfoForm from "./_components/BusinessInfoForm";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default function BusinessInfoPage() {
  return (
    <div className="w-full flex items-start justify-center pt-8">
      <section className="w-full max-w-2xl rounded-2xl border border-[#DFDFDF] shadow-sm p-6 md:p-8 bg-white">
        <BusinessInfoForm />
      </section>
    </div>
  );
}
