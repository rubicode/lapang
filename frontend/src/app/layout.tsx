import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lapang.id - Temukan & Reservasi Lapangan Olahraga Se-Indonesia",
  description: "Platform peta interaktif dan reservasi lapangan olahraga terlengkap di seluruh Indonesia (Futsal, Badminton, Basket, Tenis, Padel, Voli).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="h-screen flex flex-col overflow-hidden bg-gray-50 text-slate-800 font-sans">
        {children}
      </body>
    </html>
  );
}
