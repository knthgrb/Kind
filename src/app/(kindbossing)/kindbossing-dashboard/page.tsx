import { UserService } from "@/services/server/UserService";
import KindBossingDashboard from "../_components/KindBossingDashboard";
import { redirect } from "next/navigation";

export default async function KindBossingDashboardPage() {
  const { role } = await UserService.getCurrentUserRole();
  if (role !== "kindbossing") redirect("/forbidden");
  return <KindBossingDashboard />;
}
