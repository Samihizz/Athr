import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
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

  // Fetch reaction counts per post
  const postIds = (posts || []).map((p) => p.id);
  const reactionCounts: Record<string, number> = {};
  const userReactions = new Set<string>();

  if (postIds.length > 0) {
    const { data: reactions } = await supabase
      .from("post_reactions")
      .select("post_id, user_id")
      .in("post_id", postIds);

    if (reactions) {
      for (const r of reactions) {
        reactionCounts[r.post_id] = (reactionCounts[r.post_id] || 0) + 1;
        if (r.user_id === user.id) {
          userReactions.add(r.post_id);
        }
      }
    }
  }

  // Fetch comment counts per post
  const commentCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: comments } = await supabase
      .from("post_comments")
      .select("post_id")
      .in("post_id", postIds);

    if (comments) {
      for (const c of comments) {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      }
    }
  }

  const postsWithAuthors = (posts || []).map((p) => {
    const author = authorMap.get(p.author_id);
    return {
      ...p,
      author_name: author?.full_name || null,
      author_avatar: author?.avatar_url || null,
      reaction_count: reactionCounts[p.id] || 0,
      user_reacted: userReactions.has(p.id),
      comment_count: commentCounts[p.id] || 0,
    };
  });

  return (
    <>
      <AuthNavbar locale={locale} userName={profile?.full_name || user.email || ""} userId={user.id} isAdmin={profile?.is_admin} />
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "الشمارات" : "Feed"}
          subtitle={
            isAr
              ? "شارك أفكارك واسأل أسئلتك وخليك على تواصل مع المجتمع."
              : "Share insights, ask questions, and stay connected with the community."
          }

          coverGradient="linear-gradient(135deg, #1800AD 0%, #4B2FE8 40%, #7C3AED 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 mx-auto max-w-2xl mt-8">
        <ContentFeed
          posts={postsWithAuthors}
          locale={locale}
          tracks={tracks.map((t) => ({ id: t.id, name: isAr ? t.ar.name : t.en.name }))}
          userId={user.id}
          userName={profile?.full_name || user.email || ""}
          userAvatar={profile?.avatar_url || undefined}
          isAdmin={profile?.is_admin || false}
        />
        </div>
      </main>
    </>
  );
}
