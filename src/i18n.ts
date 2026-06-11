import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        work: 'WORK',
        about: 'ABOUT',
        skills: 'SKILLS',
        contact: 'CONTACT',
      },
      hero: {
        role: 'Environment Artist — 3D',
        kicker: 'PORTFOLIO — 2026',
        reel: 'REEL · UE5 / BLENDER',
        status: 'AVAILABLE FOR WORK',
        location: 'PARIS, FRANCE',
        scroll: 'SCROLL TO EXPLORE',
        tagline: 'worlds built to be explored',
      },
      work: {
        label: 'SELECTED WORKS',
        titleA: 'SELECTED',
        titleB: 'worlds',
        featuredLabel: 'FEATURED ENVIRONMENTS',
        archiveLabel: 'PROPS & STUDIES',
        intro:
          'Real-time environments crafted in Unreal Engine 5 — atmosphere, lighting and micro-detail layered until raw geometry becomes a living place.',
        viewProject: 'OPEN',
        counter: 'PROJECTS',
      },
      about: {
        label: 'ABOUT',
        titleA: 'WORLDS BUILT',
        titleB: 'with intention',
        bio: 'Passionate environment artist specialized in crafting immersive, detailed worlds. I blend visual storytelling with technical performance to bring compelling video-game universes to life.',
        bio2: 'My expertise spans the full pipeline: modeling (3ds Max, Blender, ZBrush), PBR texturing (Substance 3D), photogrammetry (RealityCapture), real-time lighting and optimization on Unreal Engine 5 and Unity HDRP. Unreal 3D trainer since 2025; received Best Game award at GameJam — Ubisoft Montréal jury.',
        stats: [
          { value: '6+', label: 'Years of 3D production' },
          { value: '15', label: 'Worlds & props in this portfolio' },
          { value: '1×', label: 'Best Game — GameJam, Ubisoft Montréal jury' },
          { value: 'UE5 · UNITY', label: 'Real-time engines in production' },
        ],
        experienceHeading: 'EXPERIENCE',
        experience: [
          { years: '2025 — 2026', role: 'Unreal Environment Artist Trainer', place: '3IS Education, Paris' },
          { years: '2024 — 2025', role: 'Environment Artist / Lead 3D', place: 'Rebound CG, Angoulême' },
          { years: '2022 — 2023', role: '3D VR Artist', place: 'JHH Applications, Bordeaux' },
          { years: '2019 — 2024', role: 'Freelance 3D Artist', place: 'Various clients' },
        ],
        cvHeading: 'RESUME',
        cvEnglish: 'CV — ENGLISH',
        cvFrench: 'CV — FRANÇAIS',
        availability: 'Open to freelance, full-time and creative collaborations.',
      },
      skills: {
        label: 'EXPERTISE',
        titleA: 'GRAPHICS',
        titleB: 'settings',
        description:
          'Over 6 years of professional experience in 3D environment art, from sculpting terrains to lighting final scenes — currently teaching UE5 environment art at 3IS Paris.',
        hint: '// Spec sheet rendered as a graphics settings menu. Most presets are maxed.',
        categories: ['SOFTWARE', 'TECHNICAL', 'ARTISTIC'],
        levels: { ultra: 'ULTRA', high: 'HIGH', medium: 'MEDIUM', learning: 'LEARNING' },
        softwareSkills: [
          { name: 'Unreal Engine 5', level: 0.95 },
          { name: 'Substance 3D', level: 0.95 },
          { name: '3ds Max', level: 0.95 },
          { name: 'Megascans', level: 0.95 },
          { name: 'Blender', level: 0.9 },
          { name: 'RealityCapture', level: 0.9 },
          { name: 'Marmoset Toolbag', level: 0.9 },
          { name: 'ZBrush', level: 0.85 },
          { name: 'Houdini', level: 0.45 },
        ],
        technicalSkills: [
          { name: 'Lighting & Atmosphere', level: 0.95 },
          { name: 'Photogrammetry', level: 0.9 },
          { name: 'Level Optimization', level: 0.9 },
          { name: 'Procedural Workflows', level: 0.85 },
          { name: 'Version Control (Git)', level: 0.85 },
          { name: 'Shader Development', level: 0.8 },
          { name: 'Blueprint / UE5 Logic', level: 0.75 },
        ],
        artisticSkills: [
          'Environmental Storytelling',
          'Composition & Framing',
          'PBR Material Creation',
          'Vegetation Art',
          'Hard-Surface Modeling',
          'Photogrammetry Pipeline',
          'Color & Light Theory',
          'Concept Interpretation',
        ],
      },
      contact: {
        label: 'GET IN TOUCH',
        titleA: "LET'S BUILD",
        titleB: 'worlds together',
        description:
          'Available for freelance projects, full-time positions, and creative collaborations. Based in Paris — working remotely worldwide.',
        emailCta: 'WRITE ME',
        socialsLabel: 'ELSEWHERE',
        localTime: 'LOCAL TIME',
      },
      footer: {
        rights: '© 2026 DAN HOUDEBINE — ALL RIGHTS RESERVED.',
        tagline: 'DESIGNED & BUILT WITH PASSION',
        location: 'PARIS, FRANCE',
        backToTop: 'BACK TO TOP',
        marquee: ['ENVIRONMENT ART', 'LEVEL ART', 'LIGHTING', 'PHOTOGRAMMETRY', 'WORLD BUILDING'],
      },
    },
  },
  fr: {
    translation: {
      nav: {
        work: 'TRAVAUX',
        about: 'À PROPOS',
        skills: 'COMPÉTENCES',
        contact: 'CONTACT',
      },
      hero: {
        role: "Artiste d'Environnement — 3D",
        kicker: 'PORTFOLIO — 2026',
        reel: 'REEL · UE5 / BLENDER',
        status: 'DISPONIBLE',
        location: 'PARIS, FRANCE',
        scroll: 'DÉFILER POUR EXPLORER',
        tagline: 'des mondes faits pour être explorés',
      },
      work: {
        label: 'TRAVAUX SÉLECTIONNÉS',
        titleA: 'MONDES',
        titleB: 'choisis',
        featuredLabel: 'ENVIRONNEMENTS PHARES',
        archiveLabel: 'PROPS & ÉTUDES',
        intro:
          "Environnements temps réel façonnés sous Unreal Engine 5 — atmosphère, lumière et micro-détail superposés jusqu'à ce que la géométrie brute devienne un lieu vivant.",
        viewProject: 'OUVRIR',
        counter: 'PROJETS',
      },
      about: {
        label: 'À PROPOS',
        titleA: 'DES MONDES CONSTRUITS',
        titleB: 'avec intention',
        bio: "Artiste d'environnement passionné, spécialisé dans la création de mondes immersifs et détaillés, j'allie narration visuelle et performance technique pour donner vie à des univers de jeux vidéo convaincants.",
        bio2: "Mon expertise couvre l'ensemble du pipeline : modélisation (3ds Max, Blender, ZBrush), texturing PBR (Substance 3D), photogrammétrie (RealityCapture), éclairage temps réel et optimisation sur Unreal Engine 5 et Unity HDRP. Formateur 3D Unreal depuis 2025, j'ai également reçu le prix du meilleur jeu au GameJam — jury Ubisoft Montréal.",
        stats: [
          { value: '6+', label: 'Années de production 3D' },
          { value: '15', label: 'Mondes & props dans ce portfolio' },
          { value: '1×', label: 'Meilleur jeu — GameJam, jury Ubisoft Montréal' },
          { value: 'UE5 · UNITY', label: 'Moteurs temps réel en production' },
        ],
        experienceHeading: 'EXPÉRIENCE',
        experience: [
          { years: '2025 — 2026', role: 'Formateur Environment Artist Unreal', place: '3IS Education, Paris' },
          { years: '2024 — 2025', role: 'Environment Artist / Lead 3D', place: 'Rebound CG, Angoulême' },
          { years: '2022 — 2023', role: 'Artiste 3D VR', place: 'JHH Applications, Bordeaux' },
          { years: '2019 — 2024', role: 'Artiste 3D Freelance', place: 'Clients variés' },
        ],
        cvHeading: 'CV',
        cvEnglish: 'CV — ENGLISH',
        cvFrench: 'CV — FRANÇAIS',
        availability: 'Ouvert au freelance, au CDI et aux collaborations créatives.',
      },
      skills: {
        label: 'EXPERTISE',
        titleA: 'RÉGLAGES',
        titleB: 'graphiques',
        description:
          "Plus de 6 ans d'expérience professionnelle dans l'art environnemental 3D, du sculptage de terrains à l'éclairage des scènes finales — actuellement formateur 3D UE5 à la 3IS Paris.",
        hint: '// Fiche technique présentée comme un menu de réglages graphiques. La plupart des presets sont au maximum.',
        categories: ['LOGICIELS', 'TECHNIQUE', 'ARTISTIQUE'],
        levels: { ultra: 'ULTRA', high: 'ÉLEVÉ', medium: 'MOYEN', learning: 'EN COURS' },
        softwareSkills: [
          { name: 'Unreal Engine 5', level: 0.95 },
          { name: 'Substance 3D', level: 0.95 },
          { name: '3ds Max', level: 0.95 },
          { name: 'Megascans', level: 0.95 },
          { name: 'Blender', level: 0.9 },
          { name: 'RealityCapture', level: 0.9 },
          { name: 'Marmoset Toolbag', level: 0.9 },
          { name: 'ZBrush', level: 0.85 },
          { name: 'Houdini', level: 0.45 },
        ],
        technicalSkills: [
          { name: 'Éclairage & Atmosphère', level: 0.95 },
          { name: 'Photogrammétrie', level: 0.9 },
          { name: 'Optimisation de Niveaux', level: 0.9 },
          { name: 'Workflows Procéduraux', level: 0.85 },
          { name: 'Contrôle de Version (Git)', level: 0.85 },
          { name: 'Développement Shaders', level: 0.8 },
          { name: 'Blueprint / Logique UE5', level: 0.75 },
        ],
        artisticSkills: [
          'Narration Environnementale',
          'Composition & Cadrage',
          'Création Matériaux PBR',
          'Art de la Végétation',
          'Modélisation Hard-Surface',
          'Pipeline Photogrammétrie',
          'Théorie Couleur & Lumière',
          'Interprétation de Concepts',
        ],
      },
      contact: {
        label: 'CONTACTEZ-MOI',
        titleA: 'CONSTRUISONS',
        titleB: 'des mondes ensemble',
        description:
          'Disponible pour des projets freelance, des postes en CDI et des collaborations créatives. Basé à Paris — travaille à distance partout dans le monde.',
        emailCta: 'ÉCRIVEZ-MOI',
        socialsLabel: 'AILLEURS',
        localTime: 'HEURE LOCALE',
      },
      footer: {
        rights: '© 2026 DAN HOUDEBINE — TOUS DROITS RÉSERVÉS.',
        tagline: 'CONÇU & DÉVELOPPÉ AVEC PASSION',
        location: 'PARIS, FRANCE',
        backToTop: 'RETOUR EN HAUT',
        marquee: ['ENVIRONMENT ART', 'LEVEL ART', 'LIGHTING', 'PHOTOGRAMMÉTRIE', 'WORLD BUILDING'],
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
