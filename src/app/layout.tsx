import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mouse Create — Learn Tech & Design Skills",
  description:
    "An online learning platform designed for young people to build the tech & design skills they need to become creative problem solvers. Courses in circuitry, game design, web literacy, coding, green technology, and more.",
  keywords: ["STEM", "coding", "game design", "web literacy", "circuitry", "green tech", "youth education"],
  openGraph: {
    title: "Mouse Create — Learn Tech & Design Skills",
    description: "Build tech & design skills through hands-on projects and courses designed for young creative problem solvers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body className={`${spaceGrotesk.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
