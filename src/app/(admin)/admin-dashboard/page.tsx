import React from "react";
import AdminDashboard from "../_components/AdminDashboard";
import { UserService } from "@/services/server/UserService";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const { role } = await UserService.getCurrentUserRole();
  if (role !== "admin") redirect("/forbidden");
  return <AdminDashboard />;
}
