import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KidsVerse — Fun Learning for Kids",
    template: "%s | KidsVerse",
  },
  description:
    "A safe, fun, and educational platform for children ages 2–10. Learn, play, watch, create, and explore with interactive games, stories, and creative tools.",
  keywords: [
    "kids",
    "children",
    "educational",
    "learning",
    "games",
    "stories",
    "creative",
    "toddlers",
    "preschool",
    "elementary",
  ],
  authors: [{ name: "KidsVerse Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "KidsVerse — Fun Learning for Kids",
    description: "A safe, fun, and educational platform for children ages 2–10.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://kidsverse.app",
    siteName: "KidsVerse",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KidsVerse — Fun Learning for Kids",
    description: "A safe, fun, and educational platform for children ages 2–10.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#1E293B" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunito.variable} font-nunito antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-kids focus:bg-kids-sun focus:px-4 focus:py-2 focus:text-kids-dark focus:shadow-kids-lg"
        >
          Skip to main content
        </a>
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
