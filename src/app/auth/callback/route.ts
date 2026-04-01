import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const locale = searchParams.get("locale") || "en";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Component context
          }
        },
      },
    }
  );

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password recovery via PKCE: redirect to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/${locale}/reset-password`);
      }
      return await redirectAfterAuth(supabase, origin, locale);
    }
  }

  // Handle email verification (token_hash + type)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "email" | "recovery" | "invite",
    });
    if (!error) {
      // Password recovery: redirect to reset-password page instead of dashboard
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/${locale}/reset-password`);
      }
      return await redirectAfterAuth(supabase, origin, locale);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login`);
}

async function redirectAfterAuth(
  supabase: ReturnType<typeof createServerClient>,
  origin: string,
  locale: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("bio, referral_code, referred_by")
      .eq("id", user.id)
      .single();

    // Process referral data from user metadata (set during signup)
    const metadata = user.user_metadata || {};
    if (profile && !profile.referral_code && metadata.referral_code) {
      await supabase
        .from("profiles")
        .update({ referral_code: metadata.referral_code })
        .eq("id", user.id);
    }

    if (profile && !profile.referred_by && metadata.referred_by) {
      // Set referred_by on the new user's profile
      await supabase
        .from("profiles")
        .update({ referred_by: metadata.referred_by })
        .eq("id", user.id);

      // Increment the referrer's referral_count
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id, referral_count")
        .eq("referral_code", metadata.referred_by)
        .single();

      if (referrer) {
        await supabase
          .from("profiles")
          .update({ referral_count: (referrer.referral_count || 0) + 1 })
          .eq("id", referrer.id);
      }
    }

    // Always go to dashboard — OnboardingFlow handles profile completion there
  }

  return NextResponse.redirect(`${origin}/${locale}/dashboard`);
}
