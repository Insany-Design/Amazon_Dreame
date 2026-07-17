import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starter Project",
  description: "A clean starting point for building your site.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
