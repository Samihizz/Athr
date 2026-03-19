/** General Athr community WhatsApp group link (admin sets this) */
export const ATHR_COMMUNITY_WHATSAPP = "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t";

export const tracks = [
  {
    id: "ai",
    icon: "/images/tracks/ai.png",
    whatsappGroup: "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t",
    en: {
      name: "AI & Emerging Tech",
      description: "Prompt engineering, AI tools, automation, building with AI",
    },
    ar: {
      name: "الذكاء الاصطناعي والتقنيات الناشئة",
      description: "هندسة الأوامر، أدوات الذكاء الاصطناعي، الأتمتة، البناء بالذكاء الاصطناعي",
    },
  },
  {
    id: "creative",
    icon: "/images/tracks/creative.png",
    whatsappGroup: "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t",
    en: {
      name: "Creative & Freelancing",
      description: "Graphic design, UI/UX, motion, photography, video editing",
    },
    ar: {
      name: "الإبداع والعمل الحر",
      description: "التصميم الجرافيكي، تجربة المستخدم، الموشن، التصوير، مونتاج الفيديو",
    },
  },
  {
    id: "business",
    icon: "/images/tracks/business.png",
    whatsappGroup: "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t",
    en: {
      name: "Business & Entrepreneurship",
      description: "Starting a business in KSA, freelance licensing, pricing, proposals",
    },
    ar: {
      name: "الأعمال وريادة الأعمال",
      description: "تأسيس مشروع في السعودية، رخص العمل الحر، التسعير، العروض",
    },
  },
  {
    id: "marketing",
    icon: "/images/tracks/marketing.png",
    whatsappGroup: "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t",
    en: {
      name: "Digital Marketing & Content",
      description: "Social media, copywriting, SEO, paid ads, personal branding",
    },
    ar: {
      name: "التسويق الرقمي والمحتوى",
      description: "وسائل التواصل، كتابة المحتوى، تحسين محركات البحث، الإعلانات، العلامة الشخصية",
    },
  },
  {
    id: "finance",
    icon: "/images/tracks/finance.png",
    whatsappGroup: "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t",
    en: {
      name: "Finance & Investment",
      description: "Personal finance, budgeting, side income, investing",
    },
    ar: {
      name: "المالية والاستثمار",
      description: "التمويل الشخصي، الميزانية، الدخل الإضافي، الاستثمار",
    },
  },
  {
    id: "tech",
    icon: "/images/tracks/tech.png",
    whatsappGroup: "https://chat.whatsapp.com/BCmwuJabcY717CB5XVgD3H?mode=gi_t",
    en: {
      name: "Tech & Development",
      description: "Web dev, app building, no-code tools, SaaS basics",
    },
    ar: {
      name: "التقنية والتطوير",
      description: "تطوير الويب، بناء التطبيقات، أدوات بدون كود، أساسيات SaaS",
    },
  },
] as const;

export type TrackId = (typeof tracks)[number]["id"];

export function getTrackById(id: string) {
  return tracks.find((t) => t.id === id);
}
