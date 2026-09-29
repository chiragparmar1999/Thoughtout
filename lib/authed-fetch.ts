"use client";
import { supabaseBrowser } from "@/lib/supabase-client";

// POSTs JSON to a same-origin API route, attaching the logged-in user's session token when present.
// The API route verifies this token itself (see lib/get-user.ts) — guests can still submit normally.
export async function authedPost(url: string, body: unknown) {
  const supabase = supabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}
