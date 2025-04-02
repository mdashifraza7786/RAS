import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Restaurant Management System",
  description: "A premium system for restaurant management and operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="overflow-hidden">
        {/* Fixed header */}
        <Header />
        
        {/* Main content with scrolling */}
        <div className="w-full h-[calc(100vh-56px)]">
            {children}
        </div>
      </body>
    </html>
  );
}
