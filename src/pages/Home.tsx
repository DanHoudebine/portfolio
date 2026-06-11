import Header from '../sections/Header';
import Hero from '../sections/Hero';
import Work from '../sections/Work';
import About from '../sections/About';
import Skills from '../sections/Skills';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

import Preloader from '../components/site/Preloader';
import Grain from '../components/site/Grain';
import Marquee from '../components/site/Marquee';
import useSmoothScroll from '../lib/useSmoothScroll';

const TOOLS = [
  'UNREAL ENGINE 5',
  'SUBSTANCE 3D',
  'BLENDER',
  'ZBRUSH',
  '3DS MAX',
  'MEGASCANS',
  'REALITYCAPTURE',
  'MARMOSET',
  'UNITY HDRP',
  'HOUDINI',
];

export default function Home() {
  useSmoothScroll();

  return (
    <>
      <Preloader />
      <Grain />
      <Header />
      <main>
        <Hero />
        <Marquee items={TOOLS} />
        <Work />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
