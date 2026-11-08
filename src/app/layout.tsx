import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const archivo = Archivo({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Top10 – countdowns on anything",
  description: "Generate a dramatic Top 10 countdown, with fun facts and images, on any topic.",
};

export const viewport: Viewport = {
  themeColor: "#09090c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable} h-full antialiased`}>
      <body className="stage relative min-h-full flex flex-col font-sans">
        <div className="relative z-10 flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
