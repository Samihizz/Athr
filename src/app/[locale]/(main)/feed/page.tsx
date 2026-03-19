import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import ContentFeed from "./ContentFeed";

export default async function FeedPage({
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
    .select("full_name, is_admin, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: posts } = await supabase
    .from("content_posts")
    .select("*")
    .eq("is_published", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  // Get author info for posts
  const authorIds = [...new Set((posts || []).map((p) => p.author_id).filter(Boolean))];
  const { data: authors } = authorIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", authorIds)
    : { data: [] };

  const authorMap = new Map((authors || []).map((a) => [a.id, a]));

  const postsWithAuthors = (posts || []).map((p) => {
    const author = authorMap.get(p.author_id);
    return {
      ...p,
      author_name: author?.full_name || null,
      author_avatar: author?.avatar_url || null,
    };
  });

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">
          {isAr ? "الشمارات" : "Content Feed"}
        </h1>
        <p className="text-muted mb-8">
          {isAr ? "شمارات مختارة من الشفاتة والخبراء" : "Curated content from the community and mentors"}
        </p>

        <ContentFeed
          posts={postsWithAuthors}
          locale={locale}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
          userId={user.id}
          userName={profile?.full_name || user.email || ""}
          userAvatar={profile?.avatar_url || undefined}
        />
      </main>
    </>
  );
}
