import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import DashboardSidebar from "@/components/DashboardSidebar";

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
      <body className="h-full overflow-hidden">
        {/* Fixed header */}
        <Header />
        
        {/* Content area with sidebar and main content */}
        <div className="flex w-full h-[calc(100vh-56px)]">
          {/* Fixed sidebar */}
          <DashboardSidebar />
          
          {/* Main content with scrolling */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
