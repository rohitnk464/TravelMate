import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SafetySOS from "@/components/features/SafetySOS";
import NetworkIndicator from "@/components/features/NetworkIndicator";
import { JourneyProvider } from "@/context/JourneyContext";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelMate | Your AI Travel Companion",
  description: "Experience the world safely with TravelMate. AI-powered guides, real-time translation, and safety features.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground antialiased min-h-screen flex flex-col")}>
        <AuthProvider>
          <JourneyProvider>
            <NetworkIndicator />
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <SafetySOS />
            <Footer />
          </JourneyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
