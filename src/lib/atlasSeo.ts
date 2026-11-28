/**
 * Typed accessors for atlasSeo.mjs (shared with prerender-seo).
 */
import {
  ATLAS_FAQS as ATLAS_FAQS_JS,
  ATLAS_SEO as ATLAS_SEO_JS,
  ATLAS_WINNER_CLUSTERS as ATLAS_WINNER_CLUSTERS_JS,
} from "./atlasSeo.mjs";

export type AtlasFaq = { q: string; a: string };
export type ClusterLink = { slug: string; label: string };
export type WinnerCluster = {
  id: string;
  title: string;
  blurb: string;
  winner: ClusterLink;
  satellites: ClusterLink[];
  hubs: ClusterLink[];
};

export const ATLAS_SEO = ATLAS_SEO_JS as {
  title: string;
  description: string;
  h1: string;
  keywords: string;
};

export const ATLAS_FAQS = ATLAS_FAQS_JS as AtlasFaq[];
export const ATLAS_WINNER_CLUSTERS = ATLAS_WINNER_CLUSTERS_JS as WinnerCluster[];
