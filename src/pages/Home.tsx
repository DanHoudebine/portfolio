import { useTranslation } from 'react-i18next';
import Header from '../sections/Header';
import Hero from '../sections/Hero';
import Work from '../sections/Work';
import About from '../sections/About';
import Skills from '../sections/Skills';
import Contact from '../sections/Contact';
import Footer from '../sections/Footer';

import Cursor from '../components/site/Cursor';
import Preloader from '../components/site/Preloader';
import Grain from '../components/site/Grain';
import Marquee from '../components/site/Marquee';
import ScrollProgress from '../components/site/ScrollProgress';
import AmbientGlow from '../components/site/AmbientGlow';
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
  const { t } = useTranslation();
  useSmoothScroll();

  return (
    <>
      <a href="#main" className="skip-link">{t('a11y.skip')}</a>

      <Cursor />
      <Preloader />
      <ScrollProgress />
      <AmbientGlow />
      <Grain />
      <Header />

      <main id="main" className="relative z-10">
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
