import AiAssistant from "@/components/AiAssistant";
import FloatingOrbs from "@/components/FloatingOrbs";

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
