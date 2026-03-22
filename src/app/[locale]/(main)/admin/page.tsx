import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthNavbar from "@/components/layout/AuthNavbar";
import AdminTabs from "./AdminTabs";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect(`/${locale}/dashboard`);

  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select("id, full_name, email, city, expertise, role, is_admin, profile_complete, avatar_url, verified, created_at")
    .order("created_at", { ascending: false });

  if (membersError) console.error("Members query error:", membersError);

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  const { data: posts } = await supabase
    .from("content_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: stats } = await supabase
    .from("community_stats")
    .select("*")
    .single();

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={true} />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "لوحة الإدارة" : "Admin Panel"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "إدارة الشفاتة والشمارات والبرامج" : "Manage members, content, and events"}
        </p>

        <AdminTabs
          members={members || []}
          events={events || []}
          posts={posts || []}
          announcements={announcements || []}
          stats={stats}
          locale={locale}
          currentUserId={user.id}
        />
      </main>
    </>
  );
}
