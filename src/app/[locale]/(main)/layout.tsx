import dynamic from "next/dynamic";
import FloatingOrbs from "@/components/FloatingOrbs";

const AiAssistant = dynamic(() => import("@/components/AiAssistant"));

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen relative">
      {/* Global floating abstract blur objects */}
      <FloatingOrbs variant="page" />
      <div className="relative z-10">
        {children}
      </div>
      <AiAssistant locale={locale} />
    </div>
  );
}
