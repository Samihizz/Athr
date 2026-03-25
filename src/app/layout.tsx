import type { Metadata, Viewport } from "next";
import { Poppins, Tajawal } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`h-full antialiased ${poppins.variable} ${tajawal.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
