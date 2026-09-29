import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { supabaseServer } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");
  return <DashboardClient user={user} />;
}
