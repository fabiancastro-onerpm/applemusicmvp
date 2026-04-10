import "./globals.css";
import React from "react";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "ONErpm Apple Command Center",
  description: "Apple Music Command Center MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
