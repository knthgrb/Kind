import { redirect } from "next/navigation";
import { ProfileService } from "@/services/server/ProfileService";
import MyProfileClient from "./_components/MyProfileClient";

export default async function MyProfilePage() {
  const profileData = await ProfileService.fetchUserProfile();
  if (!profileData) redirect("/login");

  return <MyProfileClient user={profileData} />;
}
