import { fr } from '@/app/translations/fr';
import axios from 'axios';
import { JSDOM } from 'jsdom';

type URLMetadata = {
  title: (string & { startsWith?: (prefix: string) => boolean }) | null;
  description: (string & { startsWith?: (prefix: string) => boolean }) | null;
  image: (string & { startsWith?: (prefix: string) => boolean }) | null;
  favicon: (string & { startsWith?: (prefix: string) => boolean }) | null;
  siteName: (string & { startsWith?: (prefix: string) => boolean }) | null;
};

async function fetchWithTimeout(
  url: string,
  timeout = 5000
): Promise<{ data: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios.get(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VoteMoi/1.0;)',
      },
      timeout,
      responseType: 'text',
    });
    clearTimeout(id);
    return response;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    clearTimeout(id);
    throw new Error(fr.errors.failedToFetchUrl);
  } finally {
    clearTimeout(id);
  }
}

export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  try {
    const response = await fetchWithTimeout(url);
    const dom = new JSDOM(response.data);
    const doc = dom.window.document;

    const metadata: URLMetadata = {
      title:
        doc
          .querySelector('meta[property="og:title"]')
          ?.getAttribute('content') ||
        doc
          .querySelector('meta[name="twitter:title"]')
          ?.getAttribute('content') ||
        doc.querySelector('title')?.textContent ||
        null,
      description:
        doc
          .querySelector('meta[property="og:description"]')
          ?.getAttribute('content') ||
        doc
          .querySelector('meta[name="twitter:description"]')
          ?.getAttribute('content') ||
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute('content') ||
        null,
      image:
        doc
          .querySelector('meta[property="og:image"]')
          ?.getAttribute('content') ||
        doc
          .querySelector('meta[name="twitter:image"]')
          ?.getAttribute('content') ||
        null,
      favicon:
        doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
        doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
        null,
      siteName:
        doc
          .querySelector('meta[property="og:site_name"]')
          ?.getAttribute('content') || null,
    };

    // Convert relative URLs to absolute URLs
    if (metadata.image && !metadata.image.startsWith('http')) {
      metadata.image = new URL(metadata.image, url).toString();
    }

    if (metadata.favicon && !metadata.favicon.startsWith('http')) {
      metadata.favicon = new URL(metadata.favicon, url).toString();
    }

    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: null,
      description: null,
      image: null,
      favicon: null,
      siteName: null,
    };
  }
}
