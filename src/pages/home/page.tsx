import HeroSection from './components/Herosection';
import LatestContent from './components/LatestContent';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServiceSection';
import CreatorSpotlight from './components/CreatorSpotlight';
import CommunitySection from './components/CommunitySection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <LatestContent />
      <AboutSection />
      <ServicesSection />
      <CreatorSpotlight />
      <CommunitySection />
    </>
  );
}