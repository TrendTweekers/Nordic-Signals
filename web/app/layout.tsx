import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nordic Signals — Weekly Nordic AI & engineering hiring signals",
  description:
    "Know which Nordic startups are scaling AI infra, hiring Staff ML engineers, or slowing down — before your competitors do. Weekly digest, free to start.",
  metadataBase: new URL("https://nordicsignals.com"),
  openGraph: {
    title: "Nordic Signals",
    description:
      "Weekly Nordic AI & engineering hiring signals. Know which Nordic startups are scaling AI infra before your competitors do.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
