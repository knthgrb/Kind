import { redirect } from "next/navigation";
import { ProfileService } from "@/services/ProfileService";
import ProfileClient from "./_components/ProfileClient";

export default async function ProfilePage() {
  console.log("🚀 ProfilePage - Starting...");
  
  const profile = await ProfileService.getCompleteKindTaoProfile();
  
  console.log("📊 ProfilePage - Profile result:", profile ? "Found" : "Not found");

  if (!profile) {
    console.log("❌ ProfilePage - No profile found, redirecting to login");
    redirect("/login");
  }

  console.log("✅ ProfilePage - Profile found, rendering ProfileClient");
  return <ProfileClient user={profile} />;
}
