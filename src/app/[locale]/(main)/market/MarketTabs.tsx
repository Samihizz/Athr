"use client";

import { useState } from "react";
import Link from "next/link";
import MarketList from "./MarketList";
import JobsList from "@/app/[locale]/(main)/jobs/JobsList";
import type { Service, Job } from "@/types";

type MarketTabsProps = {
  services: Service[];
  jobs: Job[];
  locale: string;
  tracks: { id: string; name: string }[];
  currentUserId: string;
};

export default function MarketTabs({ services, jobs, locale, tracks, currentUserId }: MarketTabsProps) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"services" | "jobs">("services");

  return (
    <div>
      {/* Tabs + Create buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Tab buttons */}
        <div className="flex gap-1 p-1 glass rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("services")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "services"
                ? "gradient-gold text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {isAr ? "الخدمات" : "Services"}
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "jobs"
                ? "gradient-gold text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {isAr ? "الفرص الوظيفية" : "Jobs"}
          </button>
        </div>

        {/* Create buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/market/create`}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {isAr ? "انشر خدمة" : "Post a Service"}
          </Link>
          <Link
            href={`/${locale}/market/create-job`}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {isAr ? "انشر فرصة" : "Post Opportunity"}
          </Link>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "services" ? (
        <MarketList
          services={services}
          locale={locale}
          tracks={tracks}
          currentUserId={currentUserId}
        />
      ) : (
        <JobsList
          jobs={jobs}
          locale={locale}
          tracks={tracks}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
