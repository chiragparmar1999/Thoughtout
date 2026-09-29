import { supabaseAdmin } from "@/lib/supabase";

// Verifies the bearer token sent by the browser and returns the real user id, or null for guests.
// Never trust a user_id the client sends directly — always resolve it server-side from the token.
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
