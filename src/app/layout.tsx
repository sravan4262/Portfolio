import type { Metadata } from "next";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";
import { AudioProvider } from "@/lib/audio-context";
import { profile } from "@/content/stages";

export const metadata: Metadata = {
  metadataBase: new URL("https://sravanravula.dev"),
  title: `${profile.name} — ${profile.title}`,
  description: profile.summary,
  openGraph: {
    title: `${profile.name} — Career Pipeline`,
    description: profile.summary,
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Career Pipeline`,
    description: profile.summary,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono">
        <ModeProvider>
          <AudioProvider>{children}</AudioProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
