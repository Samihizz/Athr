"use client";

import { useState } from "react";
import ConnectionsList from "./ConnectionsList";
import PendingRequests from "./PendingRequests";
import SuggestedConnections from "./SuggestedConnections";

type ConnectionsTabsProps = {
  userId: string;
  userCity: string | null;
  userTrack: string | null;
  locale: string;
  pendingCount: number;
};

export default function ConnectionsTabs({
  userId,
  userCity,
  userTrack,
  locale,
  pendingCount,
}: ConnectionsTabsProps) {
  const isAr = locale === "ar";
  const [tab, setTab] = useState<"connections" | "pending" | "suggested">("connections");

  const t = {
    myConnections: isAr ? "شبكتي" : "My Connections",
    pending: isAr ? "طلبات الاتصال" : "Pending Requests",
    suggested: isAr ? "فِرد مقترحين" : "Suggested",
  };

  const tabs = [
    { id: "connections" as const, label: t.myConnections },
    { id: "pending" as const, label: t.pending, badge: pendingCount },
    { id: "suggested" as const, label: t.suggested },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 glass rounded-xl mb-6 overflow-x-auto">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              tab === item.id
                ? "gradient-gold text-background"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {item.label}
            {item.badge && item.badge > 0 ? (
              <span className={`ms-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs rounded-full font-bold ${
                tab === item.id
                  ? "bg-background/20 text-background"
                  : "bg-gold/20 text-gold"
              }`}>
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "connections" && (
        <ConnectionsList userId={userId} locale={locale} />
      )}
      {tab === "pending" && (
        <PendingRequests userId={userId} locale={locale} />
      )}
      {tab === "suggested" && (
        <SuggestedConnections
          userId={userId}
          userCity={userCity}
          userTrack={userTrack}
          locale={locale}
          limit={12}
        />
      )}
    </div>
  );
}
