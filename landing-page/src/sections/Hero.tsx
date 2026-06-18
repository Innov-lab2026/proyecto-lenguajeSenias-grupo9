import SectionLayout from "../layout/SectionLayout";
import HeroContent from "../components/hero/HeroContent";
import HeroIllustration from "../components/hero/HeroIllustration";

export default function Hero() {
  return (
    <SectionLayout
      id="home"
      className="flex flex-col sm:flex-row sm:justify-evenly 
                items-center sm:items-stretch pb-0 
               bg-surface sm:bg-background 
                bg-[url('./assets/images/hero/hero-bg-2.webp')] bg-no-repeat bg-cover 
                min-h-0 sm:max-h-166.75 overflow-x-clip z-10"
    >
      <HeroContent />
      <HeroIllustration />
      
    </SectionLayout>
  );
}