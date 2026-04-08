"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type ProfileInfo = {
  id: string;
  full_name: string | null;
  city: string | null;
  expertise: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string | string[] | null;
  education: string | null;
  experience: string | null;
};

type MentorshipRequest = {
  id: string;
  mentee_id: string;
  mentor_id: string;
  track: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  mentors: ProfileInfo[];
  myRequests: MentorshipRequest[];
  incomingRequests: MentorshipRequest[];
  profileMap: Record<string, ProfileInfo>;
  trackMap: Record<string, string>;
  currentUserId: string;
  locale: string;
};

export default function MentorshipContent({
  mentors: initialMentors,
  myRequests: initialMyRequests,
  incomingRequests: initialIncoming,
  profileMap,
  trackMap,
  currentUserId,
  locale,
}: Props) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"find" | "my" | "requests">("find");
  const [trackFilter, setTrackFilter] = useState("all");
  const [modalMentor, setModalMentor] = useState<ProfileInfo | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [myRequests, setMyRequests] = useState(initialMyRequests);
  const [incomingRequests, setIncomingRequests] = useState(initialIncoming);
  const [successMsg, setSuccessMsg] = useState("");

  const t = {
    findMentors: isAr ? "لاقي مرشد" : "Find Mentors",
    myMentorship: isAr ? "إرشادي" : "My Mentorship",
    requests: isAr ? "الطلبات" : "Requests",
    requestMentorship: isAr ? "اطلب إرشاد" : "Request Mentorship",
    myMentors: isAr ? "مرشديني" : "My Mentors",
    myMentees: isAr ? "المتدربين" : "My Mentees",
    accept: isAr ? "قبول" : "Accept",
    decline: isAr ? "رفض" : "Decline",
    pending: isAr ? "في الانتظار" : "Pending",
    accepted: isAr ? "تم القبول" : "Accepted",
    declined: isAr ? "مرفوض" : "Declined",
    completed: isAr ? "مكتمل" : "Completed",
    sendMessage: isAr ? "ابعت رسالة مع طلبك" : "Send a message with your request",
    send: isAr ? "ارسال" : "Send Request",
    cancel: isAr ? "إلغاء" : "Cancel",
    all: isAr ? "الكل" : "All",
    noMentors: isAr ? "لا يوجد مرشدون في هذا المسار بعد" : "No mentors available in this track yet",
    noRequests: isAr ? "لا توجد طلبات" : "No requests yet",
    noMentorship: isAr ? "ليس لديك إرشاد نشط" : "No active mentorships yet",
    incomingRequests: isAr ? "طلبات واردة" : "Incoming Requests",
    outgoingRequests: isAr ? "طلبات صادرة" : "Outgoing Requests",
    requestSent: isAr ? "تم إرسال الطلب!" : "Request sent!",
    alreadyRequested: isAr ? "تم الطلب مسبقاً" : "Already requested",
    availableMentor: isAr ? "متاح كمرشد" : "Available as Mentor",
    viewProfile: isAr ? "عرض الملف" : "View Profile",
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending": return t.pending;
      case "accepted": return t.accepted;
      case "declined": return t.declined;
      case "completed": return t.completed;
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "accepted": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "declined": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "completed": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default: return "text-muted bg-surface border-border";
    }
  };

  // Filter mentors already requested
  const requestedMentorIds = new Set(myRequests.map((r) => r.mentor_id));

  const filteredMentors = initialMentors.filter((m) => {
    if (m.id === currentUserId) return false;
    if (trackFilter !== "all" && m.expertise !== trackFilter) return false;
    return true;
  });

  const acceptedMentors = myRequests
    .filter((r) => r.status === "accepted")
    .map((r) => ({ request: r, profile: profileMap[r.mentor_id] }))
    .filter((x) => x.profile);

  const acceptedMentees = incomingRequests
    .filter((r) => r.status === "accepted")
    .map((r) => ({ request: r, profile: profileMap[r.mentee_id] }))
    .filter((x) => x.profile);

  const pendingOutgoing = myRequests.filter((r) => r.status === "pending");
  const pendingIncoming = incomingRequests.filter((r) => r.status === "pending");

  const parseSkills = (skills: string | string[] | null): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return String(skills).split(",").map((s) => s.trim()).filter(Boolean);
  };

  async function handleRequest(mentorId: string, track: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("mentorship_requests").insert({
        mentee_id: currentUserId,
        mentor_id: mentorId,
        track,
        message: message || null,
      }).select().single();

      if (!error && data) {
        setMyRequests((prev) => [...prev, data as MentorshipRequest]);
        setSuccessMsg(t.requestSent);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
      setModalMentor(null);
      setMessage("");
    });
  }

  async function handleUpdateRequest(requestId: string, status: "accepted" | "declined") {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (!error) {
        setIncomingRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
      }
    });
  }

  const tabs = [
    { id: "find" as const, label: t.findMentors },
    { id: "my" as const, label: t.myMentorship },
    { id: "requests" as const, label: t.requests, badge: pendingIncoming.length },
  ];

  return (
    <div>
      {/* Success message */}
      {successMsg && (
        <div className="mb-6 glass rounded-xl p-4 border border-green-400/30 text-green-400 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "gradient-gold text-background"
                : "glass text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ms-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-background/20 text-xs font-bold">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Find Mentors Tab */}
      {activeTab === "find" && (
        <div>
          {/* Track filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setTrackFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                trackFilter === "all"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "glass text-muted hover:text-foreground"
              }`}
            >
              {t.all}
            </button>
            {Object.entries(trackMap).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setTrackFilter(id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  trackFilter === id
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "glass text-muted hover:text-foreground"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Mentor grid */}
          {filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMentors.map((mentor) => {
                const isRequested = requestedMentorIds.has(mentor.id);
                const existingRequest = myRequests.find((r) => r.mentor_id === mentor.id);
                const skills = parseSkills(mentor.skills);

                return (
                  <div
                    key={mentor.id}
                    className="glass rounded-2xl p-5 hover:bg-surface-hover transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                        {mentor.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate group-hover:text-gold transition-colors">
                          {mentor.full_name || (isAr ? "عضو" : "Member")}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          {mentor.expertise && trackMap[mentor.expertise] && (
                            <span className="text-gold">{trackMap[mentor.expertise]}</span>
                          )}
                          {mentor.city && <span>{mentor.city}</span>}
                        </div>
                      </div>
                    </div>

                    {mentor.bio && (
                      <p className="text-xs text-muted line-clamp-2 mb-3">{mentor.bio}</p>
                    )}

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Link
                        href={`/${locale}/members/${mentor.id}`}
                        className="flex-1 text-center px-3 py-2 rounded-xl text-xs font-medium glass text-muted hover:text-foreground hover:bg-surface-hover transition-all"
                      >
                        {t.viewProfile}
                      </Link>
                      {isRequested ? (
                        <span
                          className={`flex-1 text-center px-3 py-2 rounded-xl text-xs font-medium border ${statusColor(
                            existingRequest?.status || "pending"
                          )}`}
                        >
                          {statusLabel(existingRequest?.status || "pending")}
                        </span>
                      ) : (
                        <button
                          onClick={() => setModalMentor(mentor)}
                          className="flex-1 px-3 py-2 rounded-xl text-xs font-medium gradient-gold text-background hover:opacity-90 transition-opacity"
                        >
                          {t.requestMentorship}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-muted">{t.noMentors}</p>
            </div>
          )}
        </div>
      )}

      {/* My Mentorship Tab */}
      {activeTab === "my" && (
        <div className="space-y-8">
          {/* My Mentors */}
          <div>
            <h2 className="text-lg font-bold mb-4">{t.myMentors}</h2>
            {acceptedMentors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedMentors.map(({ request, profile }) => (
                  <MentorshipCard
                    key={request.id}
                    profile={profile}
                    request={request}
                    trackMap={trackMap}
                    locale={locale}
                    isAr={isAr}
                    statusLabel={statusLabel}
                    statusColor={statusColor}
                    parseSkills={parseSkills}
                  />
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-sm text-muted">{t.noMentorship}</p>
              </div>
            )}
          </div>

          {/* My Mentees */}
          {acceptedMentees.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">{t.myMentees}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedMentees.map(({ request, profile }) => (
                  <MentorshipCard
                    key={request.id}
                    profile={profile}
                    request={request}
                    trackMap={trackMap}
                    locale={locale}
                    isAr={isAr}
                    statusLabel={statusLabel}
                    statusColor={statusColor}
                    parseSkills={parseSkills}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-8">
          {/* Incoming Requests */}
          <div>
            <h2 className="text-lg font-bold mb-4">{t.incomingRequests}</h2>
            {pendingIncoming.length > 0 ? (
              <div className="space-y-3">
                {pendingIncoming.map((req) => {
                  const profile = profileMap[req.mentee_id];
                  if (!profile) return null;
                  return (
                    <div key={req.id} className="glass rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                          {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/${locale}/members/${profile.id}`}
                              className="font-semibold text-sm hover:text-gold transition-colors"
                            >
                              {profile.full_name || (isAr ? "عضو" : "Member")}
                            </Link>
                            {req.track && trackMap[req.track] && (
                              <span className="text-xs text-gold">{trackMap[req.track]}</span>
                            )}
                          </div>
                          {req.message && (
                            <p className="text-xs text-muted mb-3">{req.message}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateRequest(req.id, "accepted")}
                              disabled={isPending}
                              className="px-4 py-2 rounded-xl text-xs font-medium gradient-gold text-background hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {t.accept}
                            </button>
                            <button
                              onClick={() => handleUpdateRequest(req.id, "declined")}
                              disabled={isPending}
                              className="px-4 py-2 rounded-xl text-xs font-medium glass text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                            >
                              {t.decline}
                            </button>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted">
                          {new Date(req.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-sm text-muted">{t.noRequests}</p>
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div>
            <h2 className="text-lg font-bold mb-4">{t.outgoingRequests}</h2>
            {pendingOutgoing.length > 0 ? (
              <div className="space-y-3">
                {pendingOutgoing.map((req) => {
                  const profile = profileMap[req.mentor_id];
                  if (!profile) return null;
                  return (
                    <div key={req.id} className="glass rounded-xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
                          {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/${locale}/members/${profile.id}`}
                            className="font-semibold text-sm hover:text-gold transition-colors"
                          >
                            {profile.full_name || (isAr ? "عضو" : "Member")}
                          </Link>
                          {req.track && trackMap[req.track] && (
                            <p className="text-xs text-gold mt-0.5">{trackMap[req.track]}</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor(req.status)}`}
                        >
                          {statusLabel(req.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-sm text-muted">{t.noRequests}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {modalMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setModalMentor(null);
              setMessage("");
            }}
          />
          <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-1">{t.requestMentorship}</h3>
            <p className="text-sm text-muted mb-4">
              {modalMentor.full_name}
              {modalMentor.expertise && trackMap[modalMentor.expertise]
                ? ` - ${trackMap[modalMentor.expertise]}`
                : ""}
            </p>

            <label className="block text-sm font-medium mb-2">{t.sendMessage}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder={isAr ? "اكتب رسالتك هنا..." : "Write your message here..."}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() =>
                  handleRequest(modalMentor.id, modalMentor.expertise || "")
                }
                disabled={isPending}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium gradient-gold text-background hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending ? "..." : t.send}
              </button>
              <button
                onClick={() => {
                  setModalMentor(null);
                  setMessage("");
                }}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-medium glass text-muted hover:text-foreground hover:bg-surface-hover transition-all"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MentorshipCard({
  profile,
  request,
  trackMap,
  locale,
  isAr,
  statusLabel,
  statusColor,
  parseSkills,
}: {
  profile: ProfileInfo;
  request: MentorshipRequest;
  trackMap: Record<string, string>;
  locale: string;
  isAr: boolean;
  statusLabel: (s: string) => string;
  statusColor: (s: string) => string;
  parseSkills: (s: string | string[] | null) => string[];
}) {
  const skills = parseSkills(profile.skills);
  return (
    <div className="glass rounded-2xl p-5 hover:bg-surface-hover transition-colors group">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light shrink-0">
          {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <Link
            href={`/${locale}/members/${profile.id}`}
            className="font-semibold text-sm truncate group-hover:text-gold transition-colors block"
          >
            {profile.full_name || (isAr ? "عضو" : "Member")}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted">
            {request.track && trackMap[request.track] && (
              <span className="text-gold">{trackMap[request.track]}</span>
            )}
          </div>
        </div>
      </div>

      {profile.bio && (
        <p className="text-xs text-muted line-clamp-2 mb-3">{profile.bio}</p>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary-light"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor(request.status)}`}
        >
          {statusLabel(request.status)}
        </span>
        <span className="text-[10px] text-muted">
          {new Date(request.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
        </span>
      </div>
    </div>
  );
}
