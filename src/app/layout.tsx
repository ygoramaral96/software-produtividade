import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCProvider } from "@/trpc/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerenciador de Tarefas",
  description: "Gerenciamento simples de tarefas com Next.js e tRPC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={geistSans.variable}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
