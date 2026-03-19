import AiAssistant from "@/components/AiAssistant";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen">
      {children}
      <AiAssistant locale={locale} />
    </div>
  );
}
