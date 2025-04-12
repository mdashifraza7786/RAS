import type { Metadata } from "next";
import "./globals.css";
import { LayoutProvider } from '@/components/LayoutProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';

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
        <SessionProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </SessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
