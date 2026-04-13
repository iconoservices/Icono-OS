import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { ProjectProvider } from "@/context/ProjectContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "The Digital Curator | Dashboard",
  description: "MRK Planificador and Management Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${manrope.variable} bg-surface text-on-surface flex h-screen overflow-hidden antialiased`}>
        <ProjectProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <TopNav />
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {children}
            </div>
          </main>
        </ProjectProvider>
      </body>
    </html>
  );
}
