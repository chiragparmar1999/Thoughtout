import { NextResponse } from "next/server";
import { supabaseBrowser } from "@/lib/supabase-client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "email" | "recovery" | "invite" | "email_change" | null;

  const redirectTo = new URL("/dashboard", url.origin);

  if (!tokenHash || !type) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", "Invalid confirmation link");
    return NextResponse.redirect(redirectTo);
  }

  // This route exists for projects using PKCE email confirmation links.
  const supabase = supabaseBrowser();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("error", error.message);
  }

  return NextResponse.redirect(redirectTo);
}
