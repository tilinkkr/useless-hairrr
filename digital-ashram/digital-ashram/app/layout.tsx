import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "മുടി ജ്യോത്സൻ",
  description: "മലയാളത്തിൽ അർത്ഥമില്ലാത്ത, പക്ഷേ സ്റ്റൈലിഷായ മുടി ജ്യോത്സ്യൻ ആപ്പ്",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ml" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
