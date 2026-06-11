export interface Project {
  /** 1-based index matching public/projects/project{n}.png */
  img: number;
  title: string;
  tags: string;
  year: string;
  /** featured projects get the large editorial layout */
  featured?: boolean;
}

/**
 * Single source of truth for the 15 portfolio pieces.
 * Titles are proper nouns — identical in FR and EN.
 */
export const projects: Project[] = [
  { img: 1,  title: 'The Glimmers of Twilight',              tags: 'UE5 · LUMEN · MEGASCANS',        year: '2025', featured: true },
  { img: 2,  title: 'Sanctum of the Fallen',                 tags: 'UE5 · LUMEN · SUBSTANCE',        year: '2025', featured: true },
  { img: 3,  title: 'The Cursed Legacy of the Aristocrat',   tags: 'UE5 · LUMEN · SUBSTANCE',        year: '2025', featured: true },
  { img: 4,  title: 'The Cursed Legacy of the Aristocrat — II', tags: 'UE5 · LUMEN · SUBSTANCE',     year: '2025' },
  { img: 5,  title: 'Dead Line',                             tags: 'UE5 · SUBSTANCE · MEGASCANS',    year: '2024', featured: true },
  { img: 6,  title: 'Dead Line — II',                        tags: 'UE5 · SUBSTANCE · MEGASCANS',    year: '2024' },
  { img: 7,  title: 'The Beast of the Forgotten Tunnel',     tags: 'UE5 · SUBSTANCE · MEGASCANS',    year: '2024' },
  { img: 8,  title: 'Lost Temple',                           tags: 'UE5 · MEGASCANS · SUBSTANCE',    year: '2024', featured: true },
  { img: 9,  title: 'A Plague Tale Inspiration',             tags: 'UE5 · SUBSTANCE · MEGASCANS',    year: '2024', featured: true },
  { img: 10, title: 'Colt M1911',                            tags: 'SUBSTANCE PAINTER · MARMOSET',   year: '2023' },
  { img: 11, title: 'FN Scar-L',                             tags: 'SUBSTANCE PAINTER · MARMOSET',   year: '2023' },
  { img: 12, title: 'Old Piano 1875 · Infiltrators',         tags: 'SUBSTANCE PAINTER · UNITY',      year: '2023' },
  { img: 13, title: 'Jukebox Wurlitzer 1015 · Infiltrators', tags: 'SUBSTANCE PAINTER · UNITY',      year: '2023' },
  { img: 14, title: 'Jet Engine',                            tags: '3DS MAX · SUBSTANCE · MARMOSET', year: '2022' },
  { img: 15, title: 'Exploration of Cubemaps for Level Art', tags: 'UE5 · TRIMSHEETS · SUBSTANCE',   year: '2022' },
];

export const projectSrc = (p: Project) =>
  `${import.meta.env.BASE_URL}projects/project${p.img}.png`;
