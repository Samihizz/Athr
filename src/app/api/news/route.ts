import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

type NewsItem = {
  id: string;
  title_en: string;
  title_ar: string;
  summary_en: string;
  summary_ar: string;
  source: string;
  url: string;
  category: string;
  published_at: string;
  image_url?: string;
};

const curatedNews: NewsItem[] = [
  {
    id: "1",
    title_en: "Saudi Arabia Launches New Digital Work Visa Program for Tech Professionals",
    title_ar: "السعودية تطلق برنامج تأشيرة العمل الرقمي الجديد للمتخصصين في التقنية",
    summary_en: "The Ministry of Human Resources announces a streamlined digital visa process targeting skilled technology workers, making it easier for professionals to obtain and renew work permits.",
    summary_ar: "أعلنت وزارة الموارد البشرية عن عملية تأشيرة رقمية مبسطة تستهدف العاملين المهرة في مجال التقنية، مما يسهل حصول المهنيين على تصاريح العمل وتجديدها.",
    source: "Saudi Press Agency",
    url: "https://www.spa.gov.sa",
    category: "Saudi Arabia",
    published_at: "2026-03-18T10:00:00Z",
  },
  {
    id: "2",
    title_en: "Eastern Region Tech Hub Expands with New Innovation Center in Dammam",
    title_ar: "توسع المركز التقني في المنطقة الشرقية بافتتاح مركز ابتكار جديد في الدمام",
    summary_en: "A new innovation center opens in Dammam, providing co-working spaces, mentorship programs, and funding opportunities for startups in the Eastern Region.",
    summary_ar: "افتتاح مركز ابتكار جديد في الدمام يوفر مساحات عمل مشتركة وبرامج إرشاد وفرص تمويل للشركات الناشئة في المنطقة الشرقية.",
    source: "Arab News",
    url: "https://www.arabnews.com",
    category: "Business",
    published_at: "2026-03-17T14:30:00Z",
  },
  {
    id: "3",
    title_en: "Sudan and Saudi Arabia Sign New Bilateral Trade Agreement",
    title_ar: "السودان والسعودية يوقعان اتفاقية تجارة ثنائية جديدة",
    summary_en: "The two nations strengthen economic ties with a new agreement focusing on technology transfer, agricultural exports, and professional exchange programs.",
    summary_ar: "تعزز الدولتان العلاقات الاقتصادية باتفاقية جديدة تركز على نقل التكنولوجيا والصادرات الزراعية وبرامج التبادل المهني.",
    source: "Sudan Tribune",
    url: "https://sudantribune.com",
    category: "Sudan",
    published_at: "2026-03-16T09:15:00Z",
  },
  {
    id: "4",
    title_en: "Saudi Vision 2030: New Regulations Ease Business Registration for Foreign Professionals",
    title_ar: "رؤية السعودية 2030: أنظمة جديدة تسهل تسجيل الأعمال للمهنيين الأجانب",
    summary_en: "Updated commercial regulations allow foreign professionals to register businesses more efficiently, with reduced fees and faster processing times under Vision 2030 reforms.",
    summary_ar: "تسمح الأنظمة التجارية المحدثة للمهنيين الأجانب بتسجيل أعمالهم بكفاءة أكبر، مع رسوم مخفضة وأوقات معالجة أسرع ضمن إصلاحات رؤية 2030.",
    source: "Saudi Gazette",
    url: "https://saudigazette.com.sa",
    category: "Business",
    published_at: "2026-03-15T11:00:00Z",
  },
  {
    id: "5",
    title_en: "Sudanese Professionals in KSA Launch Community Mentorship Initiative",
    title_ar: "المهنيون السودانيون في السعودية يطلقون مبادرة إرشاد مجتمعي",
    summary_en: "A new mentorship program connects experienced Sudanese professionals in the Kingdom with newcomers, offering guidance on career development and cultural integration.",
    summary_ar: "برنامج إرشاد جديد يربط المهنيين السودانيين ذوي الخبرة في المملكة بالقادمين الجدد، ويقدم التوجيه في التطوير المهني والاندماج الثقافي.",
    source: "Athr Community",
    url: "#",
    category: "Sudan",
    published_at: "2026-03-14T16:45:00Z",
  },
  {
    id: "6",
    title_en: "AI and Machine Learning Jobs Surge in Saudi Arabia's Eastern Region",
    title_ar: "ارتفاع وظائف الذكاء الاصطناعي وتعلم الآلة في المنطقة الشرقية بالسعودية",
    summary_en: "Demand for AI and ML specialists continues to grow in the Eastern Region, with major companies offering competitive packages to attract global talent.",
    summary_ar: "يستمر الطلب على متخصصي الذكاء الاصطناعي وتعلم الآلة في النمو بالمنطقة الشرقية، مع عروض تنافسية من الشركات الكبرى لاستقطاب المواهب العالمية.",
    source: "Tech in Asia",
    url: "https://www.techinasia.com",
    category: "Technology",
    published_at: "2026-03-13T08:30:00Z",
  },
  {
    id: "7",
    title_en: "Saudi Arabia Updates Iqama Regulations with Digital Renewal System",
    title_ar: "السعودية تحدث أنظمة الإقامة بنظام تجديد رقمي",
    summary_en: "The Jawazat introduces a fully digital iqama renewal process, reducing wait times and enabling professionals to manage their residency permits through the Absher platform.",
    summary_ar: "تقدم الجوازات عملية تجديد إقامة رقمية بالكامل، مما يقلل أوقات الانتظار ويمكن المهنيين من إدارة تصاريح إقامتهم عبر منصة أبشر.",
    source: "Saudi Press Agency",
    url: "https://www.spa.gov.sa",
    category: "Saudi Arabia",
    published_at: "2026-03-12T13:00:00Z",
  },
  {
    id: "8",
    title_en: "New Coworking Spaces Open for Entrepreneurs in Khobar and Dhahran",
    title_ar: "افتتاح مساحات عمل مشتركة جديدة لرواد الأعمال في الخبر والظهران",
    summary_en: "Two new premium coworking spaces launch in the Eastern Region, offering networking events, startup incubation, and business development resources.",
    summary_ar: "إطلاق مساحتي عمل مشتركتين متميزتين في المنطقة الشرقية، توفران فعاليات تواصل وحاضنات أعمال وموارد تطوير الأعمال.",
    source: "Entrepreneur Middle East",
    url: "https://www.entrepreneur.com/en-ae",
    category: "Business",
    published_at: "2026-03-11T10:20:00Z",
  },
  {
    id: "9",
    title_en: "Sudan's Tech Diaspora: Building Bridges Between Khartoum and Riyadh",
    title_ar: "المغتربون السودانيون في التقنية: بناء جسور بين الخرطوم والرياض",
    summary_en: "A growing network of Sudanese tech professionals is fostering collaboration between Sudan and Saudi Arabia, creating opportunities for cross-border innovation.",
    summary_ar: "شبكة متنامية من المتخصصين السودانيين في التقنية تعزز التعاون بين السودان والسعودية، وتخلق فرصاً للابتكار عبر الحدود.",
    source: "Wired Middle East",
    url: "https://wired.me",
    category: "Technology",
    published_at: "2026-03-10T15:00:00Z",
  },
  {
    id: "10",
    title_en: "Saudi Ministry of Education Launches Free Online Courses for Expatriate Professionals",
    title_ar: "وزارة التعليم السعودية تطلق دورات مجانية عبر الإنترنت للمهنيين المغتربين",
    summary_en: "A new initiative provides free professional development courses in Arabic and English, covering business, technology, and leadership skills.",
    summary_ar: "مبادرة جديدة توفر دورات تطوير مهني مجانية بالعربية والإنجليزية، تغطي الأعمال والتقنية ومهارات القيادة.",
    source: "Saudi Press Agency",
    url: "https://www.spa.gov.sa",
    category: "Saudi Arabia",
    published_at: "2026-03-09T07:45:00Z",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "All";

  let news = curatedNews;

  if (category && category !== "All") {
    news = curatedNews.filter((item) => item.category === category);
  }

  return NextResponse.json(news);
}
