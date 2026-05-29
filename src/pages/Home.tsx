import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Header from '../sections/Header';
import Hero3D from '../sections/Hero3D';
import About from '../sections/About';
import Work from '../sections/Work';
import Skills from '../sections/Skills';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

import VideoBackground from '../components/futuristic/VideoBackground';
import SceneBackground from '../components/futuristic/SceneBackground';
import HUD from '../components/futuristic/HUD';
import Loader from '../components/futuristic/Loader';
import useSmoothScroll from '../lib/useSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero');

  // Lenis smooth scroll for the whole page
  useSmoothScroll();

  // Track which section is in view → updates HUD
  useEffect(() => {
    const sections = ['hero', 'about', 'work', 'skills', 'contact'];
    const triggers = sections.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(id),
        onEnterBack: () => setActiveSection(id),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <>
      {/* Boot-up loader (fades out after ~2s) */}
      <Loader />

      {/* Blender-rendered cinematic reel (fixed video bg, z-index 0) */}
      <VideoBackground />

      {/* WebGL overlay: floating wireframes + particles for mouse parallax (z-index 1) */}
      <SceneBackground />

      {/* Fixed HUD overlay (section, scroll %, time, coords) */}
      <HUD activeSection={activeSection} />

      {/* Page content above the scene (zIndex layering set per-section) */}
      <div className="relative" style={{ zIndex: 5 }}>
        <Header />
        <main>
          <Hero3D />
          <About />
          <Work />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
