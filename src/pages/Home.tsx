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

/* Band 1 — Hero → Work: tool stack, LTR, small */
const TOOLS = [
  'UNREAL ENGINE 5', 'SUBSTANCE 3D', 'BLENDER', 'ZBRUSH',
  '3DS MAX', 'MEGASCANS', 'REALITYCAPTURE', 'MARMOSET', 'UNITY HDRP', 'HOUDINI',
];

/* Band 2 — Work → About: discipline words, RTL, big */
const DISCIPLINES = [
  'ENVIRONMENT ART', 'WORLD BUILDING', 'REAL-TIME', 'LIGHTING',
  'PHOTOGRAMMETRY', 'LEVEL ART', 'ATMOSPHERE',
];

/* Band 3 — About → Skills: stat phrases, LTR, small, cyan accent */
const STATS = [
  '6+ YEARS PRODUCTION', '15 WORLDS BUILT', 'BEST GAME AWARD', 'UE5 TRAINER',
  'PARIS · FRANCE', 'AVAILABLE FOR WORK',
];

/* Band 4 — Skills → Contact: software list, RTL, small */
const SOFTWARE = [
  'UE5 · LUMEN · NANITE', 'SUBSTANCE 3D PAINTER', 'BLENDER · ZBRUSH',
  '3DS MAX', 'REALITYCAPTURE', 'MARMOSET TOOLBAG', 'HOUDINI FX',
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

        {/* Band 1 — tools, LTR */}
        <Marquee items={TOOLS} size="small" direction="ltr" accentColor="var(--ember)" />

        <Work />

        {/* Band 2 — disciplines, RTL, big */}
        <Marquee items={DISCIPLINES} size="big" direction="rtl" accentColor="var(--cyan)" />

        <About />

        {/* Band 3 — stats, LTR, small, cyan accent */}
        <Marquee items={STATS} size="small" direction="ltr" accentColor="var(--cyan)" />

        <Skills />

        {/* Band 4 — software, RTL, small */}
        <Marquee items={SOFTWARE} size="small" direction="rtl" accentColor="var(--ember)" />

        <Contact />
      </main>
      <Footer />
    </>
  );
}
