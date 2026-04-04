import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StoryEvalGAN — AI Story Evaluation",
  description:
    "Generate and evaluate creative stories using an Actor-2 Critics AI system powered by GPT-4o-mini.",
  keywords: ["AI", "story", "creative writing", "evaluation", "GPT"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#030712] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
