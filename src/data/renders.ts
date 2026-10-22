export interface Render {
  /** 1-based index matching public/renders/render{n}.png */
  img: number;
  title: string;
  tags: string;
  year: string;
}

/** Realistic product / packaging renders — outside the game-art work. */
export const renders: Render[] = [
  { img: 1, title: 'Destours XXO — Ambiance',        tags: 'BLENDER · CYCLES · STUDIO LIGHTING', year: '2025' },
  { img: 2, title: 'Destours XXO — Ambiance ¾',      tags: 'BLENDER · CYCLES · STUDIO LIGHTING', year: '2025' },
  { img: 3, title: 'Destours XXO — Ambiance Plongée', tags: 'BLENDER · CYCLES · STUDIO LIGHTING', year: '2025' },
  { img: 4, title: 'Destours XXO — Packshot',        tags: 'BLENDER · CYCLES · PRODUCT VIZ',     year: '2025' },
  { img: 5, title: 'Destours XXO — Packshot ¾',      tags: 'BLENDER · CYCLES · PRODUCT VIZ',     year: '2025' },
];

export const renderSrc = (r: Render) =>
  `${import.meta.env.BASE_URL}renders/render${r.img}.png`;
