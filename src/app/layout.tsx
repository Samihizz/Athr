import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Athr — أثر | Sudanese Professional Community",
  description:
    "A professional community platform connecting Sudanese talent in KSA's Eastern Region.",
  metadataBase: new URL("https://athrsa.org"),
  openGraph: {
    title: "Athr — أثر | Sudanese Professional Community",
    description:
      "A professional community platform connecting Sudanese talent in KSA's Eastern Region.",
    url: "https://athrsa.org",
    siteName: "Athr أثر",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Athr — أثر",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athr — أثر | Sudanese Professional Community",
    description:
      "A professional community platform connecting Sudanese talent in KSA's Eastern Region.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/6.svg",
    apple: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
