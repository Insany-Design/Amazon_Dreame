import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dreame L50 Ultra",
  description: "Explore the Dreame L50 Ultra robot vacuum and its intelligent cleaning features.",
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
