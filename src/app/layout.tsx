import { Metadata } from "next";
import { Providers } from "./components/Providers";
import './globals.css'

export const metadata: Metadata = {
  title: "MTG Assistant - Alpha - By @VictorRg",
  description: "An AI-powered assistant for Magic: The Gathering. Ask it anything!",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <body>{children}</body>
      </html>
    </Providers>
  );
}
