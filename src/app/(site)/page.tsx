import Hero from "@/components/sections/Hero";
import StorySection from "@/components/sections/StorySection";
import MenuCatalog from "@/components/menu/MenuCatalog";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import LocationSection from "@/components/sections/LocationSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <StorySection />
        <MenuCatalog />
        <ReviewsSection />
        <LocationSection />
      </main>
      <Footer />
    </>
  );
}
