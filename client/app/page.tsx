import Hero from "@/components/layout/Hero";
import Destinations from "@/components/features/Destinations";
import TrustSection from "@/components/layout/TrustSection";
import AIControlDock from "@/components/features/AIControlDock";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Hero />
      <div className="relative z-10 pb-0 mt-32 container mx-auto px-6">
        <Suspense fallback={null}>
          <AIControlDock />
        </Suspense>
        <div className="space-y-0">
          <Destinations />
          <TrustSection />
        </div>
      </div>
    </div>
  );
}
