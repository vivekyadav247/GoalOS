import { useRef } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PlannerPreview from '../components/PlannerPreview';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

const LandingPage = () => {
  const featuresRef = useRef(null);
  const howRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100">
      <LandingNavbar
        onFeaturesClick={() => scrollToSection(featuresRef)}
        onHowItWorksClick={() => scrollToSection(howRef)}
      />

      <main className="mx-auto max-w-6xl space-y-14 px-4 pb-16 pt-10 text-center md:space-y-20 md:px-6 md:pt-14 lg:px-8 lg:pb-24">
        <HeroSection onViewFeatures={() => scrollToSection(featuresRef)} />

        <section id="how-it-works" ref={howRef}>
          <HowItWorksSection />
        </section>

        <section id="planner-preview">
          <PlannerPreview />
        </section>

        <section id="features" ref={featuresRef}>
          <FeaturesSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
