import { BrandsSection } from "@/components/shared/about/brands";
import { CtaSection } from "@/components/shared/about/cta";
import { HeroSection } from "@/components/shared/about/hero";
import { MissionSection } from "@/components/shared/about/mission";
import { PhilosophySection } from "@/components/shared/about/philosophy";
import { StatsBar } from "@/components/shared/about/stat-card";
import { StorySection } from "@/components/shared/about/story";
import { ValuesSection } from "@/components/shared/about/values";

export const metadata = {
  title: "About Us | Farz Supplements & Herbal Store",
  description:
    "Learn about Farz Supplements — Nigeria's trusted source for natural herbal health products.",
};

export default function AboutPage() {
  return (
    <main className="bg-[#fafaf8] text-stone-900 min-h-screen">
      <HeroSection />
      <StatsBar />
      <StorySection />
      <MissionSection />
      <ValuesSection />
      <PhilosophySection />
      <BrandsSection />
      <CtaSection />
    </main>
  );
}
