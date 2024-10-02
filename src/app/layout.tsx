import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoThon Anonymous Feedback",
  description: "Feel free to share anything with us!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
