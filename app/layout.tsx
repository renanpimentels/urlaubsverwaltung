import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Urlaubsverwaltung",
  description: "Interne Anwendung zur Verwaltung von Urlaubsanträgen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="min-h-screen bg-slate-100 text-slate-950">
          <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
            <Sidebar />

            <section className="px-6 py-8 sm:px-10">{children}</section>
          </div>
        </main>
      </body>
    </html>
  );
}