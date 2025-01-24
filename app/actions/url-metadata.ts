import { fr } from '@/app/translations/fr';
import { getLinkPreview } from 'link-preview-js';

interface URLMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

async function fetchWithTimeout(
  url: string,
  timeout = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VoteMoi/1.0;)',
      },
    });
    clearTimeout(id);
    return response;
  } catch {
    clearTimeout(id);
    throw new Error(fr.errors.failedToFetchUrl);
  } finally {
    clearTimeout(id);
  }
}

async function extractMetadataFromHTML(url: string): Promise<URLMetadata> {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (selectors: string[]): string | null => {
      for (const selector of selectors) {
        const element = doc.querySelector(selector) as HTMLMetaElement | null;
        if (element?.content) {
          return element.content;
        }
      }
      return null;
    };

    const title =
      doc.querySelector('title')?.textContent ||
      getMetaContent([
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
      ]) ||
      new URL(url).hostname ||
      null;

    const description =
      getMetaContent([
        'meta[property="og:description"]',
        'meta[name="twitter:description"]',
        'meta[name="description"]',
      ]) || null;

    const image =
      getMetaContent([
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[name="image"]',
      ]) || null;

    const siteName =
      getMetaContent(['meta[property="og:site_name"]']) ||
      new URL(url).hostname ||
      null;

    const favicon =
      doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
      doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
      new URL(url).origin + '/favicon.ico';

    return {
      title: title?.trim() || null,
      description: description?.trim() || null,
      image: image?.trim() || null,
      favicon: favicon ? new URL(favicon, url).href : null,
      siteName: siteName?.trim() || null,
    };
  } catch {
    throw new Error(fr.errors.failedToFetchMetadata);
  }
}

export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  try {
    // First try using link-preview-js
    const preview = (await getLinkPreview(url)) as any;

    // Handle both HTML and non-HTML responses
    const title =
      typeof preview.title === 'string' ? preview.title : new URL(url).hostname;
    const description =
      typeof preview.description === 'string' ? preview.description : null;
    const images = Array.isArray(preview.images)
      ? preview.images
      : typeof preview.image === 'string'
        ? [preview.image]
        : [];
    const siteName =
      typeof preview.siteName === 'string'
        ? preview.siteName
        : new URL(url).hostname;

    return {
      title,
      description,
      image: images.length > 0 ? images[0] : null,
      favicon: typeof preview.favicon === 'string' ? preview.favicon : null,
      siteName,
    };
  } catch (error) {
    console.error(
      'Error using link-preview-js, falling back to HTML extraction:',
      error
    );
    // Fall back to HTML extraction
    return extractMetadataFromHTML(url);
  }
}
