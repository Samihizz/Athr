import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tracks } from "@/lib/tracks";
import AuthNavbar from "@/components/layout/AuthNavbar";
import PageHeader from "@/components/PageHeader";
import TrackIcon from "@/components/TrackIcon";

export default async function TracksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <>
      <AuthNavbar
        locale={locale}
        userName={profile?.full_name || user.email || ""}
        userId={user.id}
        isAdmin={profile?.is_admin}
      />
      <main className="pt-20 pb-16">
        <PageHeader
          title={isAr ? "المسارات" : "Tracks"}
          subtitle={
            isAr
              ? "استكشف المسارات المهنية وانضم للي يناسبك."
              : "Explore professional tracks and join the one that fits you."
          }
          coverGradient="linear-gradient(135deg, #1800AD 0%, #6366F1 40%, #8B5CF6 100%)"
          locale={locale}
        />

        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => {
              const name = isAr ? track.ar.name : track.en.name;
              const desc = isAr ? track.ar.description : track.en.description;

              return (
                <Link
                  key={track.id}
                  href={`/${locale}/tracks/${track.id}`}
                  className="group card p-6 flex flex-col gap-4 hover:border-primary-light/30"
                >
                  <div className="flex items-center gap-4">
                    <TrackIcon trackId={track.id} size={48} />
                    <h2 className="text-lg font-semibold group-hover:text-white transition-colors">
                      {name}
                    </h2>
                  </div>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                  <div className="mt-auto pt-2">
                    <span className="text-xs font-medium text-primary-light group-hover:text-gold transition-colors">
                      {isAr ? "استكشف المسار ←" : "Explore track →"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
