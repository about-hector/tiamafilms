import type { Metadata } from "next";
import { inter, playfair, montserrat, oswald } from "@/lib/fonts";
import { SITE_CONFIG } from "@/lib/constants";
import { VideoProvider } from "@/contexts/VideoContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: "TIAMAFILMS" }],
  creator: "TIAMAFILMS",
  publisher: "TIAMAFILMS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${montserrat.variable} ${oswald.variable} font-inter antialiased bg-neutral-50 text-neutral-900 overflow-x-hidden`}
      >
        <VideoProvider
          enableAutoPreload={true}
          priorityVideoIds={['caroline-eran', 'celine-chris', 'irene-steven', 'kirstie-kyle', 'roxanna-james']}
        >
          {children}
        </VideoProvider>
      </body>
    </html>
  );
}
