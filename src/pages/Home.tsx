import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from '../sections/Header';
import Hero3D from '../sections/Hero3D';
import Work from '../sections/Work';
import Skills from '../sections/Skills';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    // Wait for hero ScrollTrigger to be created
    const timer = setTimeout(() => {
      const heroST = ScrollTrigger.getAll().find(
        (st) => st.vars.trigger === '.hero-section'
      );

      if (!heroST) return;

      // Get all content sections
      const contentSections = ['#work', '#skills', '#contact'];
      const maxScroll = ScrollTrigger.maxScroll(window);

      if (!maxScroll) return;

      // Create snap points
      const pinnedHeight = heroST.end! - heroST.start!;
      const contentStart = pinnedHeight;

      // Build snap targets
      const snapTargets: number[] = [];

      // Add hero snap at start of content (after pin)
      snapTargets.push(contentStart / maxScroll);

      // Add snaps for each content section
      contentSections.forEach((selector) => {
        const el = document.querySelector(selector);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          snapTargets.push(top / maxScroll);
        }
      });

      // Global snap configuration
      ScrollTrigger.create({
        snap: {
          snapTo: (progress: number) => {
            // Don't snap during hero pin
            if (progress * maxScroll < pinnedHeight - 50) {
              return progress;
            }

            // Find nearest snap target
            const target = snapTargets.reduce((closest, curr) => {
              return Math.abs(curr - progress) < Math.abs(closest - progress)
                ? curr
                : closest;
            }, snapTargets[0]);

            return target;
          },
          duration: { min: 0.3, max: 0.8 },
          delay: 0.1,
          ease: 'power2.inOut',
        },
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative">
      <Header />
      <main>
        <Hero3D />
        <Work />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
