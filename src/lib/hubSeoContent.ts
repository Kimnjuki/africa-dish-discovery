import {
  HUB_SEO_CONTENT as HUB_SEO_CONTENT_JS,
  getHubSeoContent as getHubSeoContentJs,
} from "./hubSeoContent.mjs";

export type HubSection = {
  heading?: string;
  paragraphs: string[];
  links?: { href: string; label: string }[];
};

export type HubContent = {
  h1: string;
  intro: string;
  sections: HubSection[];
};

export const HUB_SEO_CONTENT = HUB_SEO_CONTENT_JS as Record<string, HubContent>;

export function getHubSeoContent(path: string): HubContent | null {
  return getHubSeoContentJs(path);
}
