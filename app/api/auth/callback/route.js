import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Redirect to reset password page for password recovery
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/auth/reset-password", request.url),
        );
      }

      // Redirect to next page for other types
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Redirect to error page if something goes wrong
  return NextResponse.redirect(new URL("/auth/error", request.url));
}
