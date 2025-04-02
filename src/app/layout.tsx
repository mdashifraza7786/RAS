import type { Metadata } from "next";
import "./globals.css";
import { LayoutProvider } from '@/components/LayoutProvider';

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
    <html lang="en" className="">
      <body className="h-full">
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
