import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/services/profile/fetchUserProfile";
import ProfileClient from "./_components/ProfileClient";

export default async function ProfilePage() {
  const profile = await fetchUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return <ProfileClient user={profile} />;
}
