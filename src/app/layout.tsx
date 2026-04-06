import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agents Hotel — AI Workspace",
  description: "Tu oficina virtual de agentes IA. Showcase empresarial, networking y marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#060610] text-white font-['Silkscreen',cursive]">
        {children}
      </body>
    </html>
  );
}
