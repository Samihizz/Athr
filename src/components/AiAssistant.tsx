"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type AiAssistantProps = {
  locale: string;
};

function detectArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
}

const knowledgeBase = {
  visa: {
    keywords: ["visa", "تأشيرة", "تاشيرة", "فيزا", "entry", "دخول"],
    en: "For visa information in Saudi Arabia:\n\n- **Work Visa**: Requires a job offer from a Saudi employer who will sponsor your visa through the Ministry of Human Resources.\n- **Visit Visa**: Can be obtained through the Enjaz platform (visa.mofa.gov.sa).\n- **Business Visa**: Available for short-term business activities.\n\nFor the latest updates, visit the Saudi Ministry of Foreign Affairs website or the Enjaz portal.",
    ar: "معلومات التأشيرات في السعودية:\n\n- **تأشيرة العمل**: تتطلب عرض عمل من صاحب عمل سعودي يكفلك عبر وزارة الموارد البشرية.\n- **تأشيرة الزيارة**: يمكن الحصول عليها عبر منصة إنجاز (visa.mofa.gov.sa).\n- **تأشيرة الأعمال**: متاحة للأنشطة التجارية قصيرة المدة.\n\nللاطلاع على آخر التحديثات، زر موقع وزارة الخارجية السعودية أو بوابة إنجاز.",
  },
  iqama: {
    keywords: ["iqama", "إقامة", "اقامة", "residency", "permit", "تصريح", "absher", "أبشر", "ابشر", "jawazat", "جوازات"],
    en: "Iqama (Residency Permit) Information:\n\n- **Renewal**: Done through the Absher platform (absher.sa) or your employer's Muqeem account.\n- **Fees**: Annual renewal fees vary by profession. Check Absher for current rates.\n- **Digital Iqama**: Available through the Absher app - no need to carry the physical card.\n- **Status Check**: Use Absher or the Jawazat portal to check your iqama status.\n\nTip: Keep your iqama renewed on time to avoid penalties.",
    ar: "معلومات الإقامة:\n\n- **التجديد**: يتم عبر منصة أبشر (absher.sa) أو حساب مقيم الخاص بصاحب العمل.\n- **الرسوم**: رسوم التجديد السنوية تختلف حسب المهنة. تحقق من أبشر للأسعار الحالية.\n- **الإقامة الرقمية**: متاحة عبر تطبيق أبشر - لا حاجة لحمل البطاقة الفعلية.\n- **التحقق من الحالة**: استخدم أبشر أو بوابة الجوازات للتحقق من حالة إقامتك.\n\nنصيحة: جدد إقامتك في الوقت المحدد لتجنب الغرامات.",
  },
  business: {
    keywords: ["business", "أعمال", "اعمال", "register", "تسجيل", "company", "شركة", "commercial", "تجاري", "startup", "ناشئة", "misa", "sagia"],
    en: "Business Registration in Saudi Arabia:\n\n- **Commercial Registration (CR)**: Apply through the Ministry of Commerce portal (mc.gov.sa).\n- **MISA License**: Foreign investors need a license from the Ministry of Investment (misa.gov.sa).\n- **Types**: LLC, Joint Stock Company, Branch Office, or Regional HQ.\n- **Steps**: 1) Reserve trade name 2) Draft articles of association 3) Get CR 4) Register with GOSI and Zakat authority.\n\nThe process has been significantly streamlined under Vision 2030.",
    ar: "تسجيل الأعمال في السعودية:\n\n- **السجل التجاري**: قدم عبر بوابة وزارة التجارة (mc.gov.sa).\n- **ترخيص وزارة الاستثمار**: المستثمرون الأجانب يحتاجون ترخيصاً من وزارة الاستثمار (misa.gov.sa).\n- **الأنواع**: شركة ذات مسؤولية محدودة، شركة مساهمة، فرع شركة، أو مقر إقليمي.\n- **الخطوات**: 1) حجز اسم تجاري 2) صياغة عقد التأسيس 3) استخراج السجل التجاري 4) التسجيل في التأمينات وهيئة الزكاة.\n\nتم تبسيط العملية بشكل كبير ضمن رؤية 2030.",
  },
  eastern: {
    keywords: ["eastern", "الشرقية", "dammam", "الدمام", "khobar", "الخبر", "dhahran", "الظهران", "region", "منطقة"],
    en: "Eastern Region Resources:\n\n- **Business Hub**: The Eastern Region is Saudi Arabia's industrial heartland, home to Saudi Aramco and SABIC.\n- **Coworking Spaces**: Multiple options in Dammam, Khobar, and Dhahran.\n- **Networking**: Regular professional meetups and tech events.\n- **Services**: Most government services available through Dammam's service centers.\n- **Living**: Khobar and Dhahran offer excellent living standards with diverse communities.\n\nThe region is rapidly growing as a tech and innovation hub under Vision 2030.",
    ar: "موارد المنطقة الشرقية:\n\n- **مركز الأعمال**: المنطقة الشرقية هي القلب الصناعي للسعودية، موطن أرامكو وسابك.\n- **مساحات العمل المشتركة**: خيارات متعددة في الدمام والخبر والظهران.\n- **التواصل المهني**: لقاءات مهنية وفعاليات تقنية منتظمة.\n- **الخدمات**: معظم الخدمات الحكومية متاحة عبر مراكز خدمة الدمام.\n- **المعيشة**: الخبر والظهران توفران مستوى معيشة ممتاز مع مجتمعات متنوعة.\n\nالمنطقة تنمو بسرعة كمركز للتقنية والابتكار ضمن رؤية 2030.",
  },
  sudanese: {
    keywords: ["sudanese", "سوداني", "سودانية", "sudan", "السودان", "community", "مجتمع", "جالية"],
    en: "Sudanese Community Resources in KSA:\n\n- **Athr Platform**: Connect with fellow Sudanese professionals right here!\n- **Community Events**: Regular gatherings, workshops, and networking events.\n- **Mentorship**: Find experienced Sudanese mentors in your field.\n- **Embassy Services**: Sudanese Embassy in Riyadh and consulates in Jeddah.\n- **Professional Groups**: Join track-specific groups for your industry.\n\nThe Sudanese community in the Eastern Region is growing and thriving!",
    ar: "موارد المجتمع السوداني في السعودية:\n\n- **منصة أثر**: تواصل مع المهنيين السودانيين هنا!\n- **فعاليات المجتمع**: تجمعات وورش عمل وفعاليات تواصل منتظمة.\n- **الإرشاد**: اعثر على مرشدين سودانيين ذوي خبرة في مجالك.\n- **خدمات السفارة**: السفارة السودانية في الرياض والقنصليات في جدة.\n- **مجموعات مهنية**: انضم لمجموعات متخصصة في مجالك.\n\nالمجتمع السوداني في المنطقة الشرقية ينمو ويزدهر!",
  },
  jobs: {
    keywords: ["job", "وظيفة", "وظائف", "work", "عمل", "career", "مهنة", "hiring", "توظيف", "employment"],
    en: "Career Resources:\n\n- **Job Portals**: LinkedIn, Bayt.com, and Jadarat (jadarat.sa) for Saudi-specific jobs.\n- **Saudi Labor Law**: Familiarize yourself with your rights under Saudi labor law.\n- **GOSI**: Social insurance registration through gosi.gov.sa.\n- **Professional Development**: Free courses through the National eLearning Center.\n- **Networking**: Use Athr to connect with professionals in your field.\n\nTip: Keep your LinkedIn profile updated in both Arabic and English for maximum visibility.",
    ar: "موارد التوظيف:\n\n- **بوابات التوظيف**: لينكدإن، بيت.كوم، وجدارات (jadarat.sa) للوظائف في السعودية.\n- **نظام العمل السعودي**: تعرف على حقوقك بموجب نظام العمل السعودي.\n- **التأمينات**: التسجيل في التأمينات الاجتماعية عبر gosi.gov.sa.\n- **التطوير المهني**: دورات مجانية عبر المركز الوطني للتعليم الإلكتروني.\n- **التواصل**: استخدم أثر للتواصل مع المهنيين في مجالك.\n\nنصيحة: حدث ملفك على لينكدإن بالعربية والإنجليزية لأقصى ظهور.",
  },
};

function getAiResponse(userMessage: string): string {
  const isArabic = detectArabic(userMessage);
  const lowerMessage = userMessage.toLowerCase();

  for (const topic of Object.values(knowledgeBase)) {
    for (const keyword of topic.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return isArabic ? topic.ar : topic.en;
      }
    }
  }

  // Default response
  if (isArabic) {
    return "مرحباً! أنا أثر AI، مساعدك الذكي. يمكنني مساعدتك في:\n\n- معلومات التأشيرات والإقامة\n- تسجيل الأعمال في السعودية\n- موارد المنطقة الشرقية\n- موارد المجتمع السوداني\n- التوظيف والمسار المهني\n\nاكتب سؤالك وسأساعدك!";
  }
  return "Hello! I'm Athr AI, your smart assistant. I can help you with:\n\n- Visa and iqama information\n- Business registration in KSA\n- Eastern Region resources\n- Sudanese community resources\n- Jobs and career guidance\n\nType your question and I'll help!";
}

export default function AiAssistant({ locale }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAr = locale === "ar";

  const t = {
    title: isAr ? "أثر AI" : "Athr AI",
    subtitle: isAr ? "مساعدك الذكي" : "Your Smart Assistant",
    placeholder: isAr ? "اكتب سؤالك..." : "Type your question...",
    send: isAr ? "إرسال" : "Send",
    typing: isAr ? "يكتب..." : "Typing...",
    close: isAr ? "إغلاق" : "Close",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: isAr
          ? "حبابك! أنا أثر AI. كيف أقدر أساعدك اليوم؟ يمكنني مساعدتك في معلومات التأشيرات، تسجيل الأعمال، موارد المنطقة الشرقية، والمزيد."
          : "Welcome! I'm Athr AI. How can I help you today? I can assist with visa info, business registration, Eastern Region resources, and more.",
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, isAr]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getAiResponse(trimmed);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-gold glow-gold flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        aria-label={isOpen ? t.close : t.title}
      >
        {isOpen ? (
          <svg className="h-6 w-6 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] glass-strong rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-fade-in-up"
          style={{ animationDuration: "0.3s" }}
        >
          {/* Header */}
          <div className="gradient-gold px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-background text-base">{t.title}</h3>
              <p className="text-background/70 text-xs">{t.subtitle}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-background/70 hover:text-background transition-colors"
              aria-label={t.close}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                    msg.role === "user"
                      ? "gradient-gold text-background"
                      : "glass rounded-2xl text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl px-4 py-3 text-sm text-muted">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                className="flex-1 bg-surface rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted border border-border focus:border-gold focus:outline-none transition-colors"
                dir={detectArabic(input) ? "rtl" : "ltr"}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="gradient-gold rounded-xl px-4 py-3 text-background font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
