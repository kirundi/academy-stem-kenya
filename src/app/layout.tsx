import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STEM Impact Academy | Comprehensive Learning Platform",
  description:
    "An online learning platform designed for young people to build the tech & design skills they need to become creative problem solvers. Courses in circuitry, game design, web literacy, coding, green technology, and more.",
  keywords: [
    "STEM",
    "coding",
    "game design",
    "web literacy",
    "circuitry",
    "green tech",
    "youth education",
  ],
  icons: {
    icon: "/images/logo/STEM Favicon.png",
    apple: "/images/logo/STEM Favicon.png",
  },
  openGraph: {
    title: "STEM Impact Academy | Comprehensive Learning Platform",
    description:
      "Build tech & design skills through hands-on projects and courses designed for young creative problem solvers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${lexend.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
