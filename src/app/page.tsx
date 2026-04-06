import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Root redirects to auth or room
  redirect("/auth");
}
