import { useAuthStore } from "@/stores/useAuthStore";
import React from "react";
import { redirect } from "next/navigation";
import { UserService } from "@/services/server/UserService";
import KindtaoSettings from "./_components/KindtaoSettings";
import KindbossingSettings from "./_components/KindbossingSettings";

export default async function page() {
  const { role } = await UserService.getCurrentUserRole();

  if (role === "kindtao") {
    return <KindtaoSettings />;
  } else if (role === "kindbossing") {
    return <KindbossingSettings />;
  } else {
    return redirect("/forbidden");
  }
}
