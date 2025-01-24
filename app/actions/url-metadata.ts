import { getLinkPreview } from 'link-preview-js';
import * as cheerio from 'cheerio';

export interface URLMetadata {
  title: string;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
}

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VoteMoi/1.0;)'
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function extractMetadataFromHTML(url: string): Promise<URLMetadata> {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') ||
                 $('meta[name="twitter:title"]').attr('content') ||
                 $('title').text() ||
                 '';

    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="twitter:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       null;

    const image = $('meta[property="og:image"]').attr('content') ||
                 $('meta[name="twitter:image"]').attr('content') ||
                 null;

    const siteName = $('meta[property="og:site_name"]').attr('content') ||
                    new URL(url).hostname ||
                    null;

    const favicon = $('link[rel="icon"]').attr('href') ||
                   $('link[rel="shortcut icon"]').attr('href') ||
                   new URL(url).origin + '/favicon.ico';

    return {
      title: title.trim(),
      description: description?.trim() || null,
      image,
      favicon: favicon ? new URL(favicon, url).href : null,
      siteName,
    };
  } catch (error) {
    console.error('Error extracting metadata from HTML:', error);
    return {
      title: new URL(url).hostname,
      description: null,
      image: null,
      favicon: null,
      siteName: null,
    };
  }
}

export async function extractURLMetadata(url: string): Promise<URLMetadata> {
  try {
    // First try using link-preview-js
    const preview = await getLinkPreview(url) as any;
    
    // Handle both HTML and non-HTML responses
    const title = typeof preview.title === 'string' ? preview.title : new URL(url).hostname;
    const description = typeof preview.description === 'string' ? preview.description : null;
    const images = Array.isArray(preview.images) ? preview.images : 
                  (typeof preview.image === 'string' ? [preview.image] : []);
    const siteName = typeof preview.siteName === 'string' ? preview.siteName : new URL(url).hostname;
    
    return {
      title,
      description,
      image: images.length > 0 ? images[0] : null,
      favicon: typeof preview.favicon === 'string' ? preview.favicon : null,
      siteName,
    };
  } catch (error) {
    console.error('Error using link-preview-js, falling back to HTML extraction:', error);
    // Fall back to HTML extraction
    return extractMetadataFromHTML(url);
  }
}
