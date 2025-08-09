import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LangClient from "./components/LangClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ഉപയോഗമില്ലാത്ത മുടി പേജ്",
  description: "കരിമ്പട്ട 3D മുടി തിരകൾ നീങ്ങുന്ന മനോഹരമായ പശ്ചാത്തലം",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ml" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LangClient>{children}</LangClient>
      </body>
    </html>
  );
}
