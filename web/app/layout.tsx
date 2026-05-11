import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nordic-signals-production.up.railway.app";
const TITLE = "Nordic Signals — Weekly Nordic AI & engineering hiring signals";
const DESCRIPTION =
  "Know which Nordic startups are scaling AI infra, hiring Staff ML engineers, or slowing down — before your competitors do. Tracking 150+ Nordic tech companies. Weekly digest, free to start.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Nordic Signals",
  },
  description: DESCRIPTION,
  keywords: [
    "Nordic tech hiring",
    "Nordic AI startups",
    "Sweden hiring signals",
    "Finland tech jobs",
    "Stockholm ML engineer",
    "Helsinki AI hiring",
    "Nordic VC intelligence",
    "Klarna hiring",
    "Northvolt hiring",
    "Spotify hiring",
    "Nordic startup signals",
    "tech hiring intelligence",
  ],
  authors: [{ name: "Nordic Signals" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nordic Signals — Weekly Nordic AI & engineering hiring signals",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Nordic Signals",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#07090f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nordic Signals",
  url: SITE_URL,
  description: DESCRIPTION,
  sameAs: ["https://github.com/TrendTweekers/Nordic-Signals"],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Nordic Signals — Weekly hiring intelligence",
  description:
    "Automated tracker for Nordic AI / infra hiring signals across 150+ tech companies. Weekly digest covering strategic hires, AI capability signals, infra investment, and leadership moves.",
  brand: { "@type": "Brand", name: "Nordic Signals" },
  offers: [
    {
      "@type": "Offer",
      name: "Free Weekly Digest",
      price: "0",
      priceCurrency: "EUR",
    },
    {
      "@type": "Offer",
      name: "Portfolio Monitor (Private Beta)",
      price: "799",
      priceCurrency: "EUR",
      availability: "https://schema.org/PreOrder",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
