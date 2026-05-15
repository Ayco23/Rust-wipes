import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rust Wipes",
  description: "Calendar of upcoming Rust server wipes across hosters.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
