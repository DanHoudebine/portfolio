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
          'Crafting immersive 3D environments for games, film, and interactive experiences. Every world starts with a single polygon.',
          'A journey through imaginary landscapes — from procedural terrains to hand-crafted ruins, each project tells a unique visual story.',
          'Selected works spanning environmental design, level art, and real-time 3D production for AAA and indie projects.',
          'The creative process — layering atmosphere, lighting, and detail to transform simple geometry into living, breathing worlds.',
          'Technical artistry meets creative vision. Each environment balances performance optimization with visual storytelling.',
          'Ready to create something extraordinary together? Let\'s bring your vision to life.',
        ],
        scroll: 'SCROLL',
      },
      work: {
        label: 'SELECTED WORKS',
        heading: 'Every environment tells a story',
        viewProject: 'VIEW PROJECT',
        projects: [
          { title: 'Ancient Ruins', tags: 'UE5 · MEGASCANS · LUMEN', year: '2025' },
          { title: 'Cyberpunk Alley', tags: 'BLENDER · SUBSTANCE · Eevee', year: '2024' },
          { title: 'Nordic Village', tags: 'UE5 · PROCEDURAL · FOLIAGE', year: '2024' },
          { title: 'Desert Outpost', tags: 'MAYA · HOUDINI · ARNOLD', year: '2024' },
          { title: 'Underwater Temple', tags: 'BLENDER · VOLUMETRICS · CYCLES', year: '2023' },
          { title: 'Space Station', tags: 'UE5 · MODULAR · LIGHTING', year: '2023' },
          { title: 'Forest Sanctuary', tags: 'SPEEDTREE · UE5 · ATMOSPHERE', year: '2023' },
          { title: 'Industrial Zone', tags: 'BLENDER · SUBSTANCE · DECAL', year: '2022' },
          { title: 'Crystal Caves', tags: 'HOUDINI · VOLUMETRICS · REDSHIFT', year: '2022' },
          { title: 'Floating Islands', tags: 'UE5 · WORLD MACHINE · SKY', year: '2022' },
        ],
      },
      skills: {
        label: 'EXPERTISE',
        heading: 'Tools & Techniques',
        description: 'A decade of experience in 3D environment art, from sculpting terrains to lighting final scenes. Proficient in industry-standard tools and constantly exploring new workflows.',
        secondaryDescription: 'Click on the buttons below to switch between skill categories and explore proficiency levels across different areas of expertise.',
        categories: ['SOFTWARE', 'TECHNICAL', 'ARTISTIC'],
        softwareSkills: [
          { name: 'Unreal Engine', level: 0.95, label: 'Expert' },
          { name: 'Blender', level: 0.90, label: 'Advanced' },
          { name: 'Houdini', level: 0.75, label: 'Proficient' },
          { name: 'Substance Suite', level: 0.92, label: 'Expert' },
          { name: 'ZBrush', level: 0.88, label: 'Advanced' },
          { name: 'Maya', level: 0.80, label: 'Proficient' },
          { name: 'Photoshop', level: 0.85, label: 'Advanced' },
          { name: 'SpeedTree', level: 0.78, label: 'Proficient' },
          { name: 'Quixel/Megascans', level: 0.93, label: 'Expert' },
        ],
        technicalSkills: [
          { name: 'Procedural Workflows', level: 0.85 },
          { name: 'Shader Development', level: 0.80 },
          { name: 'Lighting & Atmosphere', level: 0.92 },
          { name: 'Level Optimization', level: 0.88 },
          { name: 'Blueprint/Coding', level: 0.72 },
          { name: 'Version Control (Git/Perforce)', level: 0.90 },
          { name: 'Technical Art', level: 0.85 },
        ],
        artisticSkills: [
          'Environmental Storytelling',
          'Composition & Framing',
          'Color Theory',
          'Material Creation',
          'Vegetation Art',
          'Hard-Surface Modeling',
          'Photogrammetry',
          'Concept Interpretation',
        ],
      },
      contact: {
        label: 'GET IN TOUCH',
        heading: "Let's build worlds together",
        description: 'Available for freelance projects, full-time opportunities, and collaborations. Based in Paris, working remotely worldwide.',
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
        rights: '2025 YLÉNIA STUDIO. ALL RIGHTS RESERVED.',
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
          "Création d'environnements 3D immersifs pour jeux, cinéma et expériences interactives. Chaque monde commence par un seul polygone.",
          'Un voyage à travers des paysages imaginaires — des terrains procéduraux aux ruines façonnées à la main, chaque projet raconte une histoire visuelle unique.',
          'Travaux sélectionnés couvrant la conception environnementale,\'art de niveau et la production 3D en temps réel pour des projets AAA et indie.',
          'Le processus créatif — superposition d\'atmosphère, d\'éclairage et de détails pour transformer une géométrie simple en mondes vivants.',
          'L\'art technique rencontre la vision créative. Chaque environnement équilibre optimisation des performances et narration visuelle.',
          'Prête à créer quelque chose d\'extraordinaire ensemble ? Donnons vie à votre vision.',
        ],
        scroll: 'DÉFILER',
      },
      work: {
        label: 'TRAVAUX SÉLECTIONNÉS',
        heading: 'Chaque environnement raconte une histoire',
        viewProject: 'VOIR LE PROJET',
        projects: [
          { title: 'Ruines Anciennes', tags: 'UE5 · MEGASCANS · LUMEN', year: '2025' },
          { title: 'Ruelle Cyberpunk', tags: 'BLENDER · SUBSTANCE · Eevee', year: '2024' },
          { title: 'Village Nordique', tags: 'UE5 · PROCEDURAL · FOLIAGE', year: '2024' },
          { title: 'Avant-Poste du Désert', tags: 'MAYA · HOUDINI · ARNOLD', year: '2024' },
          { title: 'Temple Sous-Marin', tags: 'BLENDER · VOLUMETRICS · CYCLES', year: '2023' },
          { title: 'Station Spatiale', tags: 'UE5 · MODULAR · LIGHTING', year: '2023' },
          { title: 'Sanctuaire Forestier', tags: 'SPEEDTREE · UE5 · ATMOSPHERE', year: '2023' },
          { title: 'Zone Industrielle', tags: 'BLENDER · SUBSTANCE · DECAL', year: '2022' },
          { title: 'Cavernes de Cristal', tags: 'HOUDINI · VOLUMETRICS · REDSHIFT', year: '2022' },
          { title: 'Îles Flottantes', tags: 'UE5 · WORLD MACHINE · SKY', year: '2022' },
        ],
      },
      skills: {
        label: 'EXPERTISE',
        heading: 'Outils & Techniques',
        description: "Une décennie d'expérience dans l'art environnemental 3D, du sculptage de terrains à l'éclairage des scènes finales. Maîtrise des outils standard de l'industrie et exploration constante de nouveaux flux de travail.",
        secondaryDescription: 'Cliquez sur les boutons ci-dessous pour basculer entre les catégories de compétences et explorer les niveaux de maîtrise dans différents domaines\'expertise.',
        categories: ['LOGICIELS', 'TECHNIQUE', 'ARTISTIQUE'],
        softwareSkills: [
          { name: 'Unreal Engine', level: 0.95, label: 'Expert' },
          { name: 'Blender', level: 0.90, label: 'Avancé' },
          { name: 'Houdini', level: 0.75, label: 'Compétent' },
          { name: 'Substance Suite', level: 0.92, label: 'Expert' },
          { name: 'ZBrush', level: 0.88, label: 'Avancé' },
          { name: 'Maya', level: 0.80, label: 'Compétent' },
          { name: 'Photoshop', level: 0.85, label: 'Avancé' },
          { name: 'SpeedTree', level: 0.78, label: 'Compétent' },
          { name: 'Quixel/Megascans', level: 0.93, label: 'Expert' },
        ],
        technicalSkills: [
          { name: 'Workflows Procéduraux', level: 0.85 },
          { name: 'Développement Shaders', level: 0.80 },
          { name: 'Éclairage & Atmosphère', level: 0.92 },
          { name: 'Optimisation de Niveaux', level: 0.88 },
          { name: 'Blueprint/Codage', level: 0.72 },
          { name: 'Contrôle de Version (Git/Perforce)', level: 0.90 },
          { name: 'Art Technique', level: 0.85 },
        ],
        artisticSkills: [
          'Narration Environnementale',
          'Composition & Cadrage',
          'Théorie des Couleurs',
          'Création de Matériaux',
          'Art de la Végétation',
          'Modélisation Hard-Surface',
          'Photogrammétrie',
          'Interprétation de Concepts',
        ],
      },
      contact: {
        label: 'CONTACTEZ-MOI',
        heading: 'Construisons des mondes ensemble',
        description: 'Disponible pour des projets freelance, des opportunités à temps plein et des collaborations. Basée à Paris, travaille à distance dans le monde entier.',
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
        rights: '2025 YLÉNIA STUDIO. TOUS DROITS RÉSERVÉS.',
        tagline: 'CONÇU & DÉVELOPPÉ AVEC PASSION',
        location: 'PARIS, FRANCE',
        tag: 'ENVIRONNEMENTS & MONDES',
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
