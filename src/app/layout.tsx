import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent.md — The Open Registry for AI Engineering Presets",
  description: "Configure any AI coding model with production-ready engineering presets in seconds. Choose a model, a task, a style — download a tested pack.",
  openGraph: {
    title: "Agent.md — The Open Registry for AI Engineering Presets",
    description: "The npm for AI engineering presets. Curated, versioned, tested standards for Claude, DeepSeek, GPT, Gemini and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
