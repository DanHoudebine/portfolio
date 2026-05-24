import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        work: 'WORK',
        skills: 'SKILLS',
        contact: 'CONTACT',
      },
      hero: {
        labels: ['INTRO', 'GALLERY', 'GALLERY', 'PROCESS', 'APPROACH', 'CONTACT'],
        descriptions: [
          'Crafting immersive 3D environments for video games — blending visual storytelling with real-time performance to bring game worlds to life.',
          'A journey through detailed worlds — from photogrammetry-scanned terrains to hand-crafted ruins, each project tells a unique visual story.',
          'Selected works spanning Sci-Fi, Fantasy, Urban, and Post-Apocalyptic environments built in Unreal Engine 5 and Unity HDRP.',
          'Full pipeline mastery — modelling, PBR texturing, photogrammetry, real-time lighting and scene optimization from concept to delivery.',
          'Technical artistry meets creative vision. Every asset balances poly budget, texture density, and atmospheric storytelling.',
          'Available for freelance missions, studio positions, or exciting collaborations. Let\'s build something extraordinary together.',
        ],
        scroll: 'SCROLL',
      },
      work: {
        label: 'SELECTED WORKS',
        heading: 'Every environment tells a story',
        viewProject: 'VIEW PROJECT',
        projects: [
          { title: 'Neon City District', tags: 'UE5 · SUBSTANCE PAINTER · LUMEN', year: '2025' },
          { title: 'Ancient Temple Ruins', tags: 'BLENDER · UNREAL ENGINE 5', year: '2025' },
          { title: 'Space Station Interior', tags: '3DS MAX · SUBSTANCE 3D · UE5', year: '2024' },
          { title: 'Dark Forest Clearing', tags: 'BLENDER · UNITY · ZBРUSH', year: '2024' },
          { title: 'Industrial Wasteland', tags: 'HOUDINI · UNREAL ENGINE 5', year: '2024' },
          { title: 'Underwater Laboratory', tags: 'BLENDER · SUBSTANCE PAINTER · UE5', year: '2023' },
          { title: 'Medieval Dungeon', tags: '3DS MAX · ZBРUSH · UNITY HDRP', year: '2023' },
          { title: 'Alien Landscape', tags: 'HOUDINI · UNREAL ENGINE 5', year: '2023' },
          { title: 'Modern Urban Rooftop', tags: 'BLENDER · SUBSTANCE 3D · UE5', year: '2022' },
          { title: 'Volcanic Cavern', tags: 'ZBРUSH · SUBSTANCE PAINTER · UE5', year: '2022' },
        ],
      },
      skills: {
        label: 'EXPERTISE',
        heading: 'Tools & Techniques',
        description: 'Full-pipeline environment artist with experience spanning modelling, PBR texturing, photogrammetry, real-time lighting, and optimization. 3D Unreal Trainer since 2025 — Best Game Award at GameJam, jury Ubisoft Montréal.',
        secondaryDescription: 'Click the buttons below to switch between skill categories and explore proficiency levels across the full production pipeline.',
        categories: ['SOFTWARE', 'TECHNICAL', 'ARTISTIC'],
        softwareSkills: [
          { name: '3ds Max', level: 0.95, label: 'Expert' },
          { name: 'Substance 3D Painter', level: 0.95, label: 'Expert' },
          { name: 'Unreal Engine 5', level: 0.95, label: 'Expert' },
          { name: 'Megascans', level: 0.95, label: 'Expert' },
          { name: 'Blender', level: 0.90, label: 'Expert' },
          { name: 'Unity HDRP', level: 0.90, label: 'Expert' },
          { name: 'RealityCapture', level: 0.90, label: 'Expert' },
          { name: 'Marmoset Toolbag', level: 0.90, label: 'Expert' },
          { name: 'ZBrush', level: 0.85, label: 'Advanced' },
          { name: 'Photoshop', level: 0.85, label: 'Advanced' },
          { name: 'Houdini', level: 0.45, label: 'Operational' },
        ],
        technicalSkills: [
          { name: 'PBR Texturing', level: 0.95 },
          { name: 'Photogrammetry', level: 0.90 },
          { name: 'Real-Time Lighting', level: 0.92 },
          { name: 'Scene Optimization', level: 0.90 },
          { name: 'Modular Workflows', level: 0.88 },
          { name: 'Version Control (Perforce)', level: 0.80 },
          { name: 'Generative AI (Midjourney, Meshy)', level: 0.90 },
        ],
        artisticSkills: [
          'Environmental Storytelling',
          'Game-Ready Environments',
          'Vegetation Art (SpeedTree)',
          'Hard-Surface Modelling',
          'Photogrammetry',
          'Material Creation',
          'Composition & Framing',
          'Concept Interpretation',
        ],
      },
      contact: {
        label: 'GET IN TOUCH',
        heading: "Let's build worlds together",
        description: 'Available for freelance missions, studio positions, and exciting collaborations. Based in Paris, working remotely worldwide.',
        social: ['ArtStation', 'LinkedIn', 'Twitter', 'Instagram', 'GitHub'],
        form: {
          name: 'Name',
          email: 'Email',
          subject: 'Subject',
          message: 'Message',
          submit: 'SEND MESSAGE',
          success: 'Message sent!',
        },
      },
      footer: {
        rights: '2026 DAN HOUDEBINE. ALL RIGHTS RESERVED.',
        tagline: 'DESIGNED & BUILT WITH PASSION',
        location: 'PARIS, FRANCE',
        tag: 'ENVIRONMENTS & WORLDS',
      },
    },
  },
  fr: {
    translation: {
      nav: {
        work: 'TRAVAUX',
        skills: 'COMPÉTENCES',
        contact: 'CONTACT',
      },
      hero: {
        labels: ['INTRO', 'GALERIE', 'GALERIE', 'PROCESSUS', 'APPROCHE', 'CONTACT'],
        descriptions: [
          "Création d'environnements 3D immersifs pour les jeux vidéo — allier narration visuelle et performance temps réel pour donner vie à des univers convaincants.",
          'Un voyage à travers des mondes détaillés — des terrains scannés par photogrammétrie aux ruines façonnées à la main, chaque projet raconte une histoire unique.',
          'Travaux sélectionnés couvrant des environnements Sci-Fi, Fantasy, Urban et Post-Apocalyptiques produits sous Unreal Engine 5 et Unity HDRP.',
          "Pipeline complet — modélisation, texturing PBR, photogrammétrie, éclairage temps réel et optimisation du concept à la livraison.",
          "L'art technique rencontre la vision créative. Chaque asset équilibre budget polygonal, densité de texture et narration atmosphérique.",
          "Disponible pour des missions freelance, des postes en studio ou des collaborations passionnantes. Créons quelque chose d'extraordinaire ensemble.",
        ],
        scroll: 'DÉFILER',
      },
      work: {
        label: 'TRAVAUX SÉLECTIONNÉS',
        heading: 'Chaque environnement raconte une histoire',
        viewProject: 'VOIR LE PROJET',
        projects: [
          { title: 'Neon City District', tags: 'UE5 · SUBSTANCE PAINTER · LUMEN', year: '2025' },
          { title: 'Ancient Temple Ruins', tags: 'BLENDER · UNREAL ENGINE 5', year: '2025' },
          { title: 'Space Station Interior', tags: '3DS MAX · SUBSTANCE 3D · UE5', year: '2024' },
          { title: 'Dark Forest Clearing', tags: 'BLENDER · UNITY · ZBРUSH', year: '2024' },
          { title: 'Industrial Wasteland', tags: 'HOUDINI · UNREAL ENGINE 5', year: '2024' },
          { title: 'Underwater Laboratory', tags: 'BLENDER · SUBSTANCE PAINTER · UE5', year: '2023' },
          { title: 'Medieval Dungeon', tags: '3DS MAX · ZBРUSH · UNITY HDRP', year: '2023' },
          { title: 'Alien Landscape', tags: 'HOUDINI · UNREAL ENGINE 5', year: '2023' },
          { title: 'Modern Urban Rooftop', tags: 'BLENDER · SUBSTANCE 3D · UE5', year: '2022' },
          { title: 'Volcanic Cavern', tags: 'ZBРUSH · SUBSTANCE PAINTER · UE5', year: '2022' },
        ],
      },
      skills: {
        label: 'EXPERTISE',
        heading: 'Outils & Techniques',
        description: "Artiste d'environnement full-pipeline avec une maîtrise couvrant la modélisation, le texturing PBR, la photogrammétrie, l'éclairage temps réel et l'optimisation. Formateur 3D Unreal depuis 2025 — Prix du meilleur jeu au GameJam, jury Ubisoft Montréal.",
        secondaryDescription: "Cliquez sur les boutons ci-dessous pour basculer entre les catégories de compétences et explorer les niveaux de maîtrise sur l'ensemble du pipeline de production.",
        categories: ['LOGICIELS', 'TECHNIQUE', 'ARTISTIQUE'],
        softwareSkills: [
          { name: '3ds Max', level: 0.95, label: 'Expert' },
          { name: 'Substance 3D Painter', level: 0.95, label: 'Expert' },
          { name: 'Unreal Engine 5', level: 0.95, label: 'Expert' },
          { name: 'Megascans', level: 0.95, label: 'Expert' },
          { name: 'Blender', level: 0.90, label: 'Expert' },
          { name: 'Unity HDRP', level: 0.90, label: 'Expert' },
          { name: 'RealityCapture', level: 0.90, label: 'Expert' },
          { name: 'Marmoset Toolbag', level: 0.90, label: 'Expert' },
          { name: 'ZBrush', level: 0.85, label: 'Avancé' },
          { name: 'Photoshop', level: 0.85, label: 'Avancé' },
          { name: 'Houdini', level: 0.45, label: 'Opérationnel' },
        ],
        technicalSkills: [
          { name: 'Texturing PBR', level: 0.95 },
          { name: 'Photogrammétrie', level: 0.90 },
          { name: 'Éclairage Temps Réel', level: 0.92 },
          { name: 'Optimisation de Scènes', level: 0.90 },
          { name: 'Workflows Modulaires', level: 0.88 },
          { name: 'Contrôle de Version (Perforce)', level: 0.80 },
          { name: 'IA Générative (Midjourney, Meshy)', level: 0.90 },
        ],
        artisticSkills: [
          'Narration Environnementale',
          'Environnements Game-Ready',
          'Végétation 3D (SpeedTree)',
          'Modélisation Hard-Surface',
          'Photogrammétrie',
          'Création de Matériaux',
          'Composition & Cadrage',
          'Interprétation de Concepts',
        ],
      },
      contact: {
        label: 'CONTACTEZ-MOI',
        heading: 'Construisons des mondes ensemble',
        description: 'Disponible pour des missions freelance, des postes en studio et des collaborations passionnantes. Basé à Paris, travaille à distance dans le monde entier.',
        social: ['ArtStation', 'LinkedIn', 'Twitter', 'Instagram', 'GitHub'],
        form: {
          name: 'Nom',
          email: 'Email',
          subject: 'Sujet',
          message: 'Message',
          submit: 'ENVOYER',
          success: 'Message envoyé !',
        },
      },
      footer: {
        rights: '2026 DAN HOUDEBINE. TOUS DROITS RÉSERVÉS.',
        tagline: 'CONÇU ET RÉALISÉ AVEC PASSION',
        location: 'PARIS, FRANCE',
        tag: 'ENVIRONNEMENTS & UNIVERS',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
