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
          'Passionate environment artist building immersive worlds for games and interactive experiences. Every world starts with a vision.',
          'A journey through imaginary landscapes — from procedural terrains to hand-crafted ruins, each environment tells a unique visual story.',
          'Selected works spanning environmental design, level art, and real-time 3D for games ranging from indie to AAA productions.',
          'The creative process — layering atmosphere, lighting, and micro-detail to transform raw geometry into living, breathing worlds.',
          'Technical artistry meets creative vision. Every environment balances performance optimization with visual storytelling.',
          "Let's build extraordinary worlds together. Available for freelance, full-time roles, and creative collaborations.",
        ],
        scroll: 'SCROLL',
      },
      work: {
        label: 'SELECTED WORKS',
        heading: 'Every environment tells a story',
        viewProject: 'VIEW PROJECT',
        projects: [
          { title: 'Ancient Ruins', tags: 'UE5 · MEGASCANS · LUMEN', year: '2025' },
          { title: 'Cyberpunk Alley', tags: 'BLENDER · SUBSTANCE · EEVEE', year: '2024' },
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
        description: 'Over 6 years of professional experience in 3D environment art, from sculpting terrains to lighting final scenes. Proficient in industry-standard tools and always exploring new workflows — currently teaching UE5 environment art at 3IS Paris.',
        secondaryDescription: 'Click on the buttons below to switch between skill categories and explore proficiency levels across different areas of expertise.',
        categories: ['SOFTWARE', 'TECHNICAL', 'ARTISTIC'],
        softwareSkills: [
          { name: 'Unreal Engine 5', level: 0.95, label: 'Expert' },
          { name: 'Substance 3D', level: 0.95, label: 'Expert' },
          { name: '3ds Max', level: 0.95, label: 'Expert' },
          { name: 'Megascans', level: 0.95, label: 'Expert' },
          { name: 'Blender', level: 0.90, label: 'Advanced' },
          { name: 'RealityCapture', level: 0.90, label: 'Advanced' },
          { name: 'Marmoset', level: 0.90, label: 'Advanced' },
          { name: 'ZBrush', level: 0.85, label: 'Advanced' },
          { name: 'Houdini', level: 0.45, label: 'Learning' },
        ],
        technicalSkills: [
          { name: 'Lighting & Atmosphere', level: 0.95 },
          { name: 'Photogrammetry', level: 0.90 },
          { name: 'Level Optimization', level: 0.90 },
          { name: 'Procedural Workflows', level: 0.85 },
          { name: 'Version Control (Git)', level: 0.85 },
          { name: 'Shader Development', level: 0.80 },
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
        heading: "Let's build worlds together",
        description: 'Available for freelance projects, full-time positions, and creative collaborations. Based in Paris — working remotely worldwide.',
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
        rights: '© 2026 DAN HOUDEBINE. ALL RIGHTS RESERVED.',
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
          "Artiste d'environnement passionné, je crée des mondes immersifs pour le jeu vidéo et les expériences interactives. Chaque monde commence par une vision.",
          'Un voyage à travers des paysages imaginaires — des terrains procéduraux aux ruines façonnées à la main, chaque projet raconte une histoire visuelle unique.',
          "Travaux sélectionnés couvrant la conception environnementale, l'art de niveau et la production 3D temps-réel pour des projets AAA et indépendants.",
          "Le processus créatif — superposer atmosphère, éclairage et détail pour transformer une géométrie simple en mondes vivants.",
          "L'art technique rencontre la vision créative. Chaque environnement équilibre optimisation et narration visuelle.",
          "Créons ensemble des mondes extraordinaires. Disponible en freelance, CDI et pour des collaborations créatives.",
        ],
        scroll: 'DÉFILER',
      },
      work: {
        label: 'TRAVAUX SÉLECTIONNÉS',
        heading: 'Chaque environnement raconte une histoire',
        viewProject: 'VOIR LE PROJET',
        projects: [
          { title: 'Ruines Anciennes', tags: 'UE5 · MEGASCANS · LUMEN', year: '2025' },
          { title: 'Ruelle Cyberpunk', tags: 'BLENDER · SUBSTANCE · EEVEE', year: '2024' },
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
        description: "Plus de 6 ans d'expérience professionnelle dans l'art environnemental 3D, du sculptage de terrains à l'éclairage des scènes finales. Maîtrise des outils de l'industrie, en constante exploration — actuellement formateur 3D UE5 à la 3IS Paris.",
        secondaryDescription: 'Cliquez sur les boutons ci-dessous pour naviguer entre les catégories de compétences et explorer les niveaux de maîtrise.',
        categories: ['LOGICIELS', 'TECHNIQUE', 'ARTISTIQUE'],
        softwareSkills: [
          { name: 'Unreal Engine 5', level: 0.95, label: 'Expert' },
          { name: 'Substance 3D', level: 0.95, label: 'Expert' },
          { name: '3ds Max', level: 0.95, label: 'Expert' },
          { name: 'Megascans', level: 0.95, label: 'Expert' },
          { name: 'Blender', level: 0.90, label: 'Avancé' },
          { name: 'RealityCapture', level: 0.90, label: 'Avancé' },
          { name: 'Marmoset', level: 0.90, label: 'Avancé' },
          { name: 'ZBrush', level: 0.85, label: 'Avancé' },
          { name: 'Houdini', level: 0.45, label: 'En apprentissage' },
        ],
        technicalSkills: [
          { name: 'Éclairage & Atmosphère', level: 0.95 },
          { name: 'Photogrammétrie', level: 0.90 },
          { name: 'Optimisation de Niveaux', level: 0.90 },
          { name: 'Workflows Procéduraux', level: 0.85 },
          { name: 'Contrôle de Version (Git)', level: 0.85 },
          { name: 'Développement Shaders', level: 0.80 },
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
        heading: 'Construisons des mondes ensemble',
        description: 'Disponible pour des projets freelance, des postes en CDI et des collaborations créatives. Basé à Paris — travaille à distance partout dans le monde.',
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
        rights: '© 2026 DAN HOUDEBINE. TOUS DROITS RÉSERVÉS.',
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
