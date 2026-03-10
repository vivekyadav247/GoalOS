import { useEffect, useRef } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import HowItWorksSection from '../components/HowItWorksSection';
import PlannerPreview from '../components/PlannerPreview';
import FeaturesSection from '../components/FeaturesSection';
import DashboardPreview from '../components/DashboardPreview';
import ProductivityPhilosophy from '../components/ProductivityPhilosophy';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const LandingPage = () => {
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const productivityRef = useRef(null);

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (revealTargets.length === 0) {
      return undefined;
    }

    document.body.classList.add('reveal-enabled');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return () => {
        document.body.classList.remove('reveal-enabled');
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -12% 0px'
      }
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      document.body.classList.remove('reveal-enabled');
    };
  }, []);

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
        onProductivityClick={() => scrollToSection(productivityRef)}
      />

      <main className="mx-auto max-w-6xl space-y-14 px-4 pb-16 pt-10 text-center md:space-y-20 md:px-6 md:pt-14 lg:px-8 lg:pb-24">
        <HeroSection onViewFeatures={() => scrollToSection(featuresRef)} />

        <section id="problem">
          <ProblemSection />
        </section>

        <section id="how-it-works" ref={howRef}>
          <HowItWorksSection />
        </section>

        <section id="features" ref={featuresRef}>
          <FeaturesSection />
        </section>

        <section id="heatmap">
          <PlannerPreview />
        </section>

        <section id="dashboard-preview">
          <DashboardPreview />
        </section>

        <section id="productivity" ref={productivityRef}>
          <ProductivityPhilosophy />
        </section>

        <section id="cta">
          <CTASection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
