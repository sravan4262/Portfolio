import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ModeProvider } from "@/lib/mode-context";
import { AudioProvider } from "@/lib/audio-context";
import { profile } from "@/content/stages";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://im-sravan-ravula.dev"),
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
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans">
        <ModeProvider>
          <AudioProvider>{children}</AudioProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
