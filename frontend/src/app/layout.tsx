import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "OmniTrackIQ",
  description: "Cross-platform analytics for e-commerce teams",
};

// Script to prevent flash of unstyled content
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', isDark);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
