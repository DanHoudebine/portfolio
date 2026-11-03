import data from '../content/renders.json';

export interface Render {
  /** repo-relative path under public/, e.g. "renders/render1.png" */
  image: string;
  title: string;
  tags: string;
  year: string;
}

/**
 * Realistic product / packaging renders — outside the game-art work.
 * Editable via the Decap CMS admin at /admin (writes src/content/renders.json).
 */
export const renders: Render[] = (data.items as Render[]);

export const renderSrc = (r: Render) => `${import.meta.env.BASE_URL}${r.image}`;
