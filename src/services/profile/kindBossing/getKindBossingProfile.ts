import { fetchUserProfile } from "../fetchUserProfile";
import { fetchJobPosts } from "./fetchJobsPosts";

export async function getBossingProfile() {
  const base = await fetchUserProfile();
  if (!base) return null;

  const jobPosts = await fetchJobPosts(base.id);

  return { profile: base, jobPosts };
}
