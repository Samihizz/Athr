import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  // Redirect to the member profile page for the current user
  redirect(`/${locale}/members/${user.id}`);
}
