import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sorted - Compare Food Prices on Swiggy & Zomato",
  description:
    "Compare restaurant prices between Swiggy and Zomato. Find the best deals and save money on every food order.",
  keywords: [
    "food delivery",
    "swiggy",
    "zomato",
    "price comparison",
    "restaurant",
    "food ordering",
    "india",
    "bangalore",
    "delhi",
    "mumbai",
  ],
  authors: [{ name: "Sorted" }],
  openGraph: {
    title: "Sorted - Compare Food Prices",
    description:
      "Find the best deals on Swiggy & Zomato. Compare prices and save money on every order.",
    type: "website",
    locale: "en_IN",
    siteName: "Sorted",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sorted - Compare Food Prices",
    description:
      "Find the best deals on Swiggy & Zomato. Compare prices and save money on every order.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
