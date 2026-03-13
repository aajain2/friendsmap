import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friends Map",
  description: "See where your friends are heading after graduation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
